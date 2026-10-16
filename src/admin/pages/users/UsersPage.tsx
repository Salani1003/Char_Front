import { useState } from "react";
import { Plus } from "lucide-react";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { Label } from "@/components/char/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { SearchBar } from "@/components/char/search-bar";
import { PageHeader } from "@/components/char/page-header";
import { toast } from "@/components/char/sonner";
import { toApiError } from "@/lib/apiError";
import { useDebounce } from "@/hooks/useDebounce";
import { UserCard } from "@/admin/components/UserCard";
import { UserFormDialog } from "@/admin/components/UserFormDialog";
import { useGroups } from "@/admin/hooks/useGroups";
import { useDeleteUser } from "@/admin/hooks/useDeleteUser";
import { useUsers } from "@/admin/hooks/useUsers";
import type { User } from "@/admin/interfaces/user.interface";
import { getUserFullName } from "@/admin/utils/getUserFullName";

/**
 * Listado de usuarios (`/admin/users`): encabezado con "Nuevo usuario",
 * buscador con debounce, filtro de estado (activos por defecto) y una tarjeta por usuario. "Nuevo usuario" y la opción
 * "Editar" de cada tarjeta abren `UserFormDialog` (alta / edición); "Eliminar"
 * abre una confirmación y, si se acepta, elimina el usuario. Los errores del
 * backend al eliminar se muestran en una alerta.
 */
type StatusFilter = "active" | "inactive" | "all";

const STATUS_ITEMS: Record<StatusFilter, string> = {
  active: "Activos",
  inactive: "Inactivos",
  all: "Todos",
};

const STATUS_PARAM: Record<StatusFilter, boolean | undefined> = {
  active: true,
  inactive: false,
  all: undefined,
};

export const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);
  const { data } = useUsers({
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
        filters={
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status-filter">Estado</Label>
            <Select
              items={STATUS_ITEMS}
              value={status}
              onValueChange={(value) => setStatus(value as StatusFilter)}
            >
              <SelectTrigger id="status-filter" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data?.results.map((user) => (
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
