import { ActionsMenu } from "@/components/char/actions-menu";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { ClientOriginBadge } from "./ClientOriginBadge";
import { useClientMenuItems } from "../hooks/useClientMenuItems";
import type { Client } from "../interfaces/client.interface";
import { formatShortDate } from "../utils/formatClientDate";
import { getClientFullName } from "../utils/getClientFullName";

/**
 * Tabla de clientes de `ClientsPage`: nombre, apellido, email, teléfono,
 * origen (chip de color, `ClientOriginBadge`) y fecha de alta, con orden por columna
 * (las `key` de las columnas son los campos de la API, así `ordering` se
 * envía tal cual). El nombre abre el detalle. La última columna es un menú de
 * acciones según `can` (`useClientMenuItems`). Cubre la carga con filas de
 * esqueleto (conserva el encabezado). Es la vista de escritorio: en celulares
 * `ClientsPage` muestra `ClientsCardList`.
 *
 * @param clients Clientes de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`).
 * @param onOrderingChange Se llama con el nuevo orden al hacer clic en un encabezado.
 * @param loading Muestra el esqueleto en lugar de las filas.
 * @param dimmed Atenúa las filas mientras se muestra la página anterior.
 * @param onView Se llama con el cliente al elegir su nombre o "Ver detalle".
 * @param onEdit Se llama con el cliente al elegir "Editar".
 * @param onDelete Se llama con el cliente al elegir "Eliminar".
 * @param className Clases del contenedor (ej. para ocultarla en celulares).
 */
export function ClientsTable({
  clients,
  ordering,
  onOrderingChange,
  loading,
  dimmed,
  onView,
  onEdit,
  onDelete,
  className,
}: {
  clients: Client[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  loading?: boolean;
  dimmed?: boolean;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  className?: string;
}) {
  const getMenuItems = useClientMenuItems({ onView, onEdit, onDelete });

  const columns: DataTableColumn<Client>[] = [
    {
      key: "first_name",
      header: "Nombre",
      sortable: true,
      cell: (client) => (
        <button
          type="button"
          onClick={() => onView(client)}
          className="rounded-sm text-left font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {client.first_name}
        </button>
      ),
    },
    {
      key: "last_name",
      header: "Apellido",
      sortable: true,
      cell: (client) => client.last_name,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      cell: (client) => (
        <span className="text-muted-foreground">{client.email}</span>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
      sortable: true,
      cell: (client) => client.phone || "—",
    },
    {
      key: "origin",
      header: "Origen",
      sortable: true,
      cell: (client) => <ClientOriginBadge origin={client.origin} />,
    },
    {
      key: "created_at",
      header: "Alta",
      sortable: true,
      cell: (client) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatShortDate(client.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      hideHeader: true,
      align: "right",
      className: "w-14",
      cell: (client) => {
        const items = getMenuItems(client);
        return items.length ? (
          <ActionsMenu
            label={`Acciones de ${getClientFullName(client)}`}
            items={items}
          />
        ) : null;
      },
    },
  ];

  return (
    <DataTable
      caption="Listado de clientes"
      columns={columns}
      rows={clients}
      getRowKey={(client) => client.id}
      ordering={ordering}
      onOrderingChange={onOrderingChange}
      loading={loading}
      dimmed={dimmed}
      className={className}
    />
  );
}
