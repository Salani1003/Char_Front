import { CalendarDays, Megaphone, Phone } from "lucide-react";
import { ActionsMenu } from "@/components/char/actions-menu";
import type { ActionsMenuItem } from "@/components/char/actions-menu";
import { Button } from "@/components/char/button";
import { EntityCard } from "@/components/char/entity-card";
import { ClientOriginBadge } from "./ClientOriginBadge";
import type { Client } from "../interfaces/client.interface";
import { formatShortDate } from "../utils/formatClientDate";
import { getClientFullName } from "../utils/getClientFullName";

/**
 * Tarjeta de un cliente para el listado en celulares (`ClientsCardList`).
 * Adapta un `Client` a la `EntityCard` genérica: nombre completo, email
 * (como subtítulo), origen, teléfono (o "—") y fecha de alta. Al pie, el botón "Ver detalle" y,
 * en la esquina, el menú de tres puntitos con las opciones permitidas por
 * `can` (sin ninguna no se muestra el menú).
 *
 * @param client Cliente a mostrar.
 * @param menuItems Opciones del menú, ya filtradas por permiso
 * (`useClientMenuItems`).
 * @param onView Se llama con el cliente al presionar "Ver detalle".
 */
export function ClientCard({
  client,
  menuItems,
  onView,
}: {
  client: Client;
  menuItems: ActionsMenuItem[];
  onView: (client: Client) => void;
}) {
  const fullName = getClientFullName(client);

  return (
    <EntityCard
      title={fullName}
      subtitle={client.email}
      menu={
        menuItems.length ? (
          <ActionsMenu label={`Acciones de ${fullName}`} items={menuItems} />
        ) : undefined
      }
      details={[
        {
          icon: <Megaphone />,
          label: "Origen",
          value: <ClientOriginBadge origin={client.origin} />,
        },
        { icon: <Phone />, label: "Teléfono", value: client.phone || "—" },
        {
          icon: <CalendarDays />,
          label: "Alta",
          value: formatShortDate(client.created_at),
        },
      ]}
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(client)}
          aria-label={`Ver detalle de ${fullName}`}
        >
          Ver detalle
        </Button>
      }
    />
  );
}
