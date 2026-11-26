import type { ReactNode } from "react";
import {
  CalendarDays,
  Mail,
  Megaphone,
  Pencil,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";
import { Can } from "@/auth/components/Can";
import { PERMISSIONS } from "@/auth/lib/permissions";
import { toApiError } from "@/lib/apiError";
import { Button } from "@/components/char/button";
import { Dialog } from "@/components/char/dialog";
import { Skeleton } from "@/components/char/skeleton";
import { StateMessage } from "@/components/char/state-message";
import { ClientOriginBadge } from "./ClientOriginBadge";
import { useClient } from "../hooks/useClient";
import type { Client } from "../interfaces/client.interface";
import { formatLongDate } from "../utils/formatClientDate";
import { getClientFullName } from "../utils/getClientFullName";

/**
 * Modal de detalle de un cliente, abierto desde `ClientsPage`: nombre y
 * apellido, email, teléfono, origen y fecha de alta en modo lectura. Muestra
 * enseguida los datos de la fila del listado y los actualiza con
 * `GET /clients/:id/` (`useClient`); si el cliente ya no existe (404) o falla
 * el pedido sin datos para mostrar, lo informa con el mensaje del backend. Al
 * pie, "Editar" (`clients.change_client`) y "Eliminar" (`clients.delete_client`)
 * según `can`; ambos cierran este modal y delegan en la pantalla.
 *
 * @param client Cliente a mostrar (la fila elegida); `null` con el modal cerrado.
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado cuando se abre o cierra.
 * @param onEdit Se llama con el cliente al presionar "Editar".
 * @param onDelete Se llama con el cliente al presionar "Eliminar".
 */
export function ClientDetailDialog({
  client,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}) {
  const { data, isError, error } = useClient(
    open ? (client?.id ?? null) : null,
    client,
  );
  const current = data ?? client;

  const details: { label: string; value: ReactNode; icon: ReactNode }[] = [
    {
      label: "Nombre y apellido",
      value: current ? (
        getClientFullName(current)
      ) : (
        <Skeleton className="h-4 w-32" />
      ),
      icon: <UserRound />,
    },
    { label: "Email", value: current?.email ?? "—", icon: <Mail /> },
    { label: "Teléfono", value: current?.phone || "—", icon: <Phone /> },
    {
      label: "Origen",
      value: current ? <ClientOriginBadge origin={current.origin} /> : "—",
      icon: <Megaphone />,
    },
    {
      label: "Alta",
      value: current ? formatLongDate(current.created_at) : "—",
      icon: <CalendarDays />,
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={current ? getClientFullName(current) : "Detalle del cliente"}
      description="Datos del cliente."
    >
      {isError && !data ? (
        <StateMessage variant="error">{toApiError(error).message}</StateMessage>
      ) : (
        <dl className="divide-y divide-border">
          {details.map(({ label, value, icon }) => (
            <div key={label} className="flex items-center gap-3 py-3">
              <span
                className="text-muted-foreground [&_svg]:size-4"
                aria-hidden
              >
                {icon}
              </span>
              <dt className="w-36 shrink-0 text-sm text-muted-foreground">
                {label}
              </dt>
              <dd className="min-w-0 flex-1 truncate text-right text-sm font-medium text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {current ? (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Can permission={PERMISSIONS.clients.delete}>
            <Button variant="danger" onClick={() => onDelete(current)}>
              <Trash2 /> Eliminar
            </Button>
          </Can>
          <Can permission={PERMISSIONS.clients.change}>
            <Button onClick={() => onEdit(current)}>
              <Pencil /> Editar
            </Button>
          </Can>
        </div>
      ) : null}
    </Dialog>
  );
}
