import { useState } from "react";
import { Plus } from "lucide-react";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { SearchBar } from "@/components/char/search-bar";
import { PageHeader } from "@/components/char/page-header";
import { FiltersPopover } from "@/components/char/filters-popover";
import type {
  FilterDefinition,
  FilterValues,
} from "@/components/char/filters-popover";
import { Pagination } from "@/components/char/pagination";
import { toast } from "@/components/char/sonner";
import { StateMessage } from "@/components/char/state-message";
import { toApiError } from "@/lib/apiError";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { UserCard } from "@/admin/components/UserCard";
import { UserFormDialog } from "@/admin/components/UserFormDialog";
import { UsersListSkeleton } from "@/admin/components/UsersListSkeleton";
import { useGroups } from "@/admin/hooks/useGroups";
import { useDeleteUser } from "@/admin/hooks/useDeleteUser";
import { useUsers } from "@/admin/hooks/useUsers";
import type { User } from "@/admin/interfaces/user.interface";
import { getUserFullName } from "@/admin/utils/getUserFullName";

/**
 * Listado de usuarios (`/admin/users`): encabezado con "Nuevo usuario",
 * buscador con debounce, filtro de estado en un `FiltersPopover` (activos
 * por defecto; "Todos" o "Limpiar" muestran todos), una tarjeta
 * por usuario y paginación (`Pagination`; vuelve a la página 1 al buscar,
 * filtrar o cambiar el tamaño). Cubre los estados de carga (esqueleto de tarjetas), error (con
 * "Reintentar") y vacío con `StateMessage`. "Nuevo usuario" y la opción
 * "Editar" de cada tarjeta abren `UserFormDialog` (alta / edición); "Eliminar"
 * abre una confirmación y, si se acepta, elimina el usuario. Los errores del
 * backend al eliminar se muestran en una alerta.
 */
const USER_FILTERS: FilterDefinition[] = [
  {
    key: "status",
    type: "chips",
    label: "Estado",
    options: [
      { value: "active", label: "Activos" },
      { value: "inactive", label: "Inactivos" },
    ],
  },
];

/** Estado de la API según el chip elegido; sin chip (o "Todos") trae todos. */
const STATUS_PARAM: Record<string, boolean | undefined> = {
  active: true,
  inactive: false,
};

export const UsersPage = () => {
  useDocumentTitle("Usuarios · Char");
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  // Arranca mostrando solo los activos; "Todos" o "Limpiar" quitan el filtro.
  const [filters, setFilters] = useState<FilterValues>({ status: "active" });
  const status = filters.status ?? "";
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);
  // La página se guarda junto con los criterios con los que se eligió: si
  // cambia la búsqueda (ya con debounce), el estado o el tamaño, vuelve a 1
  // sin pedir antes una página con criterios viejos.
  const criteria = `${debouncedSearch}|${status}|${pageSize}`;
  const [pageState, setPageState] = useState({ criteria, page: 1 });
  const page = pageState.criteria === criteria ? pageState.page : 1;
  const setPage = (next: number) => setPageState({ criteria, page: next });
  const { data, isPending, isError, error, isPlaceholderData, refetch } =
    useUsers({
      page,
      page_size: pageSize,
      search: debouncedSearch,
      is_active: STATUS_PARAM[status],
    });
  const { data: groups = [] } = useGroups();
  const { mutateAsync: deleteUser } = useDeleteUser();

  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      toast.success("Usuario eliminado");
      // Si era el único de la última página, volver a la anterior.
      if (page > 1 && data?.results.length === 1) setPage(page - 1);
    } catch (error) {
      setDeleteError(toApiError(error).message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuarios"
        description="Gestioná los usuarios del sistema y sus permisos de acceso."
        actions={
          <Button onClick={openCreate}>
            <Plus /> Nuevo usuario
          </Button>
        }
      />
      <SearchBar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por nombre, email o usuario…"
        actions={
          <FiltersPopover
            filters={USER_FILTERS}
            value={filters}
            onChange={setFilters}
          />
        }
      />
      {isPending ? (
        <div role="status">
          <span className="sr-only">Cargando usuarios…</span>
          <UsersListSkeleton />
        </div>
      ) : isError ? (
        <StateMessage
          variant="error"
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        >
          {toApiError(error).message}
        </StateMessage>
      ) : data.results.length === 0 ? (
        <StateMessage variant="empty">
          {debouncedSearch || status
            ? "No se encontraron usuarios con esos filtros."
            : "Todavía no hay usuarios."}
        </StateMessage>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3",
            isPlaceholderData && "opacity-60",
          )}
        >
          {data.results.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              roles={user.groups.flatMap((id) => {
                const name = groups.find((g) => g.id === id)?.name;
                return name ? [name] : [];
              })}
              onEdit={openEdit}
              onDelete={setUserToDelete}
            />
          ))}
        </div>
      )}
      {data ? (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data.count}
          itemLabel={{ singular: "usuario", plural: "usuarios" }}
          disabled={isPlaceholderData}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      ) : null}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
      />
      <AlertDialog
        open={userToDelete !== null}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        variant="danger"
        title="¿Eliminar usuario?"
        description={
          userToDelete
            ? `Se eliminará a ${getUserFullName(userToDelete)}. Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
      />
      <AlertDialog
        open={deleteError !== null}
        onOpenChange={(open) => !open && setDeleteError(null)}
        variant="danger"
        title={deleteError ?? ""}
      />
    </div>
  );
};
