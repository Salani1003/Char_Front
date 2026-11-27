import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Can } from "@/auth/components/Can";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { FiltersPopover } from "@/components/char/filters-popover";
import type {
  FilterDefinition,
  FilterValues,
} from "@/components/char/filters-popover";
import {
  joinMultiValue,
  parseMultiValue,
} from "@/components/char/filters-popover";
import { PageHeader } from "@/components/char/page-header";
import { Pagination } from "@/components/char/pagination";
import { SearchBar } from "@/components/char/search-bar";
import { toast } from "@/components/char/sonner";
import { StateMessage } from "@/components/char/state-message";
import { toApiError } from "@/lib/apiError";
import { useDebounce } from "@/hooks/useDebounce";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ClientDetailDialog } from "@/admin/components/ClientDetailDialog";
import { ClientFormDialog } from "@/admin/components/ClientFormDialog";
import { ClientsCardList } from "@/admin/components/ClientsCardList";
import { ClientsTable } from "@/admin/components/ClientsTable";
import { CLIENT_ORIGIN_OPTIONS } from "@/admin/config/client-origins";
import { useClients } from "@/admin/hooks/useClients";
import { useClientsSearchParams } from "@/admin/hooks/useClientsSearchParams";
import { useDeleteClient } from "@/admin/hooks/useDeleteClient";
import { useRestoreClient } from "@/admin/hooks/useRestoreClient";
import type { Client } from "@/admin/interfaces/client.interface";
import { getClientFullName } from "@/admin/utils/getClientFullName";

const CLIENT_FILTERS: FilterDefinition[] = [
  {
    key: "origin",
    type: "multiselect",
    label: "Origen",
    options: CLIENT_ORIGIN_OPTIONS,
  },
  { key: "created_from", type: "date", label: "Alta desde" },
  { key: "created_to", type: "date", label: "Alta hasta" },
];

/**
 * Listado de clientes (`/admin/clients`): encabezado con "Nuevo cliente",
 * buscador (nombre, apellido o email; se aplica con debounce de 300 ms), un
 * `FiltersPopover` (origen con selección múltiple y rango de fecha de alta,
 * ambos extremos inclusivos), el botón "Limpiar filtros" (borra búsqueda y
 * filtros; el orden se conserva), el listado y paginación con selector de
 * tamaño. El listado es una tabla (`ClientsTable`, desde `md`) con orden por
 * columna (clic en el encabezado alterna ascendente/descendente; por defecto
 * los más recientes primero) y, en celulares, tarjetas (`ClientsCardList`) con
 * un control de orden. Se renderizan las dos y el CSS muestra una según el ancho.
 *
 * Todos los criterios (búsqueda, orígenes, fechas, orden, página y tamaño) se
 * guardan en la URL (`useClientsSearchParams`) para compartir o recargar, y
 * cualquier cambio de búsqueda, filtro, orden o tamaño vuelve a la página 1.
 * Cubre carga (esqueleto en la tabla), error (con "Reintentar") y vacío
 * ("No hay clientes" / "Sin resultados para los filtros") con `StateMessage`;
 * el listado se atenúa mientras `isPlaceholderData`.
 *
 * Acciones según permiso (`can`): "Nuevo cliente" (`clients.add_client`),
 * "Editar" (`clients.change_client`) y "Eliminar" (`clients.delete_client`,
 * con confirmación). Ver el detalle abre `ClientDetailDialog`. Eliminar es un
 * soft delete: la fila sale del listado y baja el conteo; si el usuario puede
 * editar, el aviso ofrece "Deshacer" (`POST /clients/:id/restore/`). Los
 * errores del backend (403, 429, 400 al restaurar) se muestran con su mensaje.
 */
export const ClientsPage = () => {
  useDocumentTitle("Clientes · Char");
  const can = useCan();
  const { criteria, page, setCriteria, setPage } = useClientsSearchParams();
  const { search: urlSearch, origins, createdFrom, createdTo } = criteria;

  // El texto se edita localmente y llega a la URL (y a la request) con debounce.
  const [search, setSearch] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    // La URL cambió (atrás/adelante, "Limpiar filtros"): reflejarlo en el campo.
    setPrevUrlSearch(urlSearch);
    if (urlSearch !== search.trim()) setSearch(urlSearch);
  }
  const debouncedSearch = useDebounce(search);
  useEffect(() => {
    // Solo escribe cuando el tipeo se asentó (el campo coincide con el debounce).
    if (debouncedSearch === search && debouncedSearch.trim() !== urlSearch) {
      setCriteria({ search: debouncedSearch }, { replace: true });
    }
  }, [debouncedSearch, search, urlSearch, setCriteria]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isPending, isError, error, isPlaceholderData, refetch } =
    useClients({
      page,
      page_size: criteria.pageSize,
      search: urlSearch,
      ordering: criteria.ordering,
      origin: origins,
      created_from: createdFrom,
      created_to: createdTo,
    });
  const { mutateAsync: deleteClient } = useDeleteClient();
  const { mutateAsync: restoreClient } = useRestoreClient();

  const hasFilters = !!(
    urlSearch ||
    origins.length ||
    createdFrom ||
    createdTo
  );
  const filterValues: FilterValues = {
    origin: joinMultiValue(origins),
    created_from: createdFrom,
    created_to: createdTo,
  };

  const clearFilters = () => {
    setSearch("");
    setCriteria({ search: "", origins: [], createdFrom: "", createdTo: "" });
  };

  const openCreate = () => {
    setEditingClient(null);
    setFormOpen(true);
  };

  const openEdit = (client: Client) => {
    setDetailOpen(false);
    setEditingClient(client);
    setFormOpen(true);
  };

  const openDetail = (client: Client) => {
    setDetailClient(client);
    setDetailOpen(true);
  };

  const askDelete = (client: Client) => {
    setDetailOpen(false);
    setClientToDelete(client);
  };

  // Mismas props para las dos vistas: tabla desde `md`, tarjetas en celulares.
  const listProps = {
    clients: data?.results ?? [],
    ordering: criteria.ordering,
    onOrderingChange: (ordering: string) => setCriteria({ ordering }),
    loading: isPending,
    dimmed: isPlaceholderData,
    onView: openDetail,
    onEdit: openEdit,
    onDelete: askDelete,
  };

  const undoDelete = async (client: Client) => {
    try {
      await restoreClient(client.id);
      toast.success("Cliente restaurado");
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    const client = clientToDelete;
    try {
      await deleteClient(client.id);
      // Si era el único de la última página, volver a la anterior.
      if (page > 1 && data?.results.length === 1) setPage(page - 1);
      toast.success(
        "Cliente eliminado",
        can(PERMISSIONS.clients.change)
          ? {
              description: getClientFullName(client),
              action: {
                label: "Deshacer",
                onClick: () => void undoDelete(client),
              },
            }
          : { description: getClientFullName(client) },
      );
    } catch (error) {
      setDeleteError(toApiError(error).message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description="Consultá y administrá la cartera de clientes."
        actions={
          <Can permission={PERMISSIONS.clients.add}>
            <Button variant="info" onClick={openCreate}>
              <Plus /> Nuevo cliente
            </Button>
          </Can>
        }
      />
      <SearchBar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por nombre, apellido o email…"
        actions={
          <>
            <FiltersPopover
              filters={CLIENT_FILTERS}
              value={filterValues}
              onChange={(values) =>
                setCriteria({
                  origins: CLIENT_ORIGIN_OPTIONS.map((o) => o.value).filter(
                    (value) => parseMultiValue(values.origin).includes(value),
                  ),
                  createdFrom: values.created_from ?? "",
                  createdTo: values.created_to ?? "",
                })
              }
            />
            {hasFilters ? (
              <Button variant="ghost" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : null}
          </>
        }
      />
      {isError ? (
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
      ) : data && data.results.length === 0 ? (
        <StateMessage
          variant="empty"
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Can permission={PERMISSIONS.clients.add}>
                <Button variant="info" onClick={openCreate}>
                  <Plus /> Nuevo cliente
                </Button>
              </Can>
            )
          }
        >
          {hasFilters ? "Sin resultados para los filtros." : "No hay clientes."}
        </StateMessage>
      ) : (
        <>
          <ClientsTable {...listProps} className="max-md:hidden" />
          <ClientsCardList {...listProps} className="md:hidden" />
        </>
      )}
      {data ? (
        <Pagination
          page={page}
          pageSize={criteria.pageSize}
          total={data.count}
          itemLabel={{ singular: "cliente", plural: "clientes" }}
          disabled={isPlaceholderData}
          onPageChange={setPage}
          onPageSizeChange={(pageSize) => setCriteria({ pageSize })}
        />
      ) : null}
      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
      />
      <ClientDetailDialog
        client={detailClient}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={openEdit}
        onDelete={askDelete}
      />
      <AlertDialog
        open={clientToDelete !== null}
        onOpenChange={(open) => !open && setClientToDelete(null)}
        variant="danger"
        title="¿Eliminar cliente?"
        description={
          clientToDelete
            ? `Se eliminará a ${getClientFullName(clientToDelete)}. Dejará de aparecer en el listado.`
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
