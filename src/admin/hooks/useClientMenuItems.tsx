import { Eye, Pencil, Trash2 } from "lucide-react";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import type { ActionsMenuItem } from "@/components/char/actions-menu";
import type { Client } from "../interfaces/client.interface";

/**
 * Opciones del menú de acciones de un cliente, filtradas por permiso (`can`):
 * "Ver detalle" (`clients.view_client`), "Editar" (`clients.change_client`) y
 * "Eliminar" (`clients.delete_client`). Las comparten la tabla (`ClientsTable`)
 * y las tarjetas (`ClientCard`). Devuelve una función que arma la lista para
 * un cliente; vacía si el usuario no puede hacer nada.
 *
 * @param handlers `onView`, `onEdit` y `onDelete`, que reciben el cliente.
 */
export const useClientMenuItems = ({
  onView,
  onEdit,
  onDelete,
}: {
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}) => {
  const can = useCan();

  return (client: Client): ActionsMenuItem[] => {
    const items: ActionsMenuItem[] = [];
    if (can(PERMISSIONS.clients.view)) {
      items.push({
        label: "Ver detalle",
        icon: <Eye />,
        onSelect: () => onView(client),
      });
    }
    if (can(PERMISSIONS.clients.change)) {
      items.push({
        label: "Editar",
        icon: <Pencil />,
        onSelect: () => onEdit(client),
      });
    }
    if (can(PERMISSIONS.clients.delete)) {
      items.push({
        label: "Eliminar",
        icon: <Trash2 />,
        onSelect: () => onDelete(client),
        variant: "danger",
      });
    }
    return items;
  };
};
