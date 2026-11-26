import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/char/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { cn } from "@/lib/utils";
import { ClientCard } from "./ClientCard";
import { UsersListSkeleton } from "./UsersListSkeleton";
import { useClientMenuItems } from "../hooks/useClientMenuItems";
import type { Client } from "../interfaces/client.interface";

/** Campos por los que se puede ordenar y su etiqueta (claves = campos de la API). */
const ORDER_FIELDS: Record<string, string> = {
  first_name: "Nombre",
  last_name: "Apellido",
  email: "Email",
  phone: "Teléfono",
  origin: "Origen",
  created_at: "Fecha de alta",
};

/**
 * Listado de clientes en tarjetas para celulares: es la vista alternativa a
 * `ClientsTable` (la pantalla muestra una u otra según el ancho). Como las
 * tarjetas no tienen encabezados donde hacer clic, incluye un control de
 * orden: un desplegable con el campo y un botón que alterna ascendente /
 * descendente, con la misma convención de `ordering` de DRF (`campo` /
 * `-campo`). Cubre la carga con el esqueleto de tarjetas (`UsersListSkeleton`).
 *
 * @param clients Clientes de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`).
 * @param onOrderingChange Se llama con el nuevo orden.
 * @param loading Muestra el esqueleto en lugar de las tarjetas.
 * @param dimmed Atenúa las tarjetas mientras se muestra la página anterior.
 * @param onView Se llama con el cliente al presionar "Ver detalle".
 * @param onEdit Se llama con el cliente al elegir "Editar".
 * @param onDelete Se llama con el cliente al elegir "Eliminar".
 */
export function ClientsCardList({
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
  const descending = ordering.startsWith("-");
  const field = ordering.replace(/^-/, "");

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <span id="clients-order-label" className="text-sm font-medium">
          Ordenar por
        </span>
        <Select
          items={ORDER_FIELDS}
          value={field}
          onValueChange={(next) =>
            onOrderingChange(descending ? `-${next}` : String(next))
          }
        >
          <SelectTrigger
            size="sm"
            className="min-w-0 flex-1"
            aria-labelledby="clients-order-label"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ORDER_FIELDS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          size="icon"
          aria-label={
            descending
              ? "Orden descendente, cambiar a ascendente"
              : "Orden ascendente, cambiar a descendente"
          }
          onClick={() => onOrderingChange(descending ? field : `-${field}`)}
        >
          {descending ? <ArrowDown /> : <ArrowUp />}
        </Button>
      </div>
      {loading ? (
        <div role="status">
          <span className="sr-only">Cargando clientes…</span>
          <UsersListSkeleton count={4} />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2",
            dimmed && "opacity-60",
          )}
        >
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              menuItems={getMenuItems(client)}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
