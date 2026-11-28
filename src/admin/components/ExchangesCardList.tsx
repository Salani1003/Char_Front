import { Link } from "react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/char/button";
import { EntityCard } from "@/components/char/entity-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { cn } from "@/lib/utils";
import { DocStatusBadge } from "./DocStatusBadge";
import { ExchangeDifference } from "./ExchangeDifference";
import { UsersListSkeleton } from "./UsersListSkeleton";
import { formatSaleMoney } from "../config/sales";
import type { Exchange } from "../interfaces/exchange.interface";
import { documentUser, exchangePath } from "../utils/sales";
import { formatDateTime } from "../utils/stock";

/** Campos de orden y su etiqueta (claves = campos de la API). */
const ORDER_FIELDS: Record<string, string> = {
  created_at: "Fecha",
  difference: "Diferencia",
  id: "Número",
};

/**
 * Listado de cambios en tarjetas para celulares: alternativa a
 * `ExchangesTable`, con "Ordenar por" y un botón asc/desc. Los anulados se
 * atenúan.
 *
 * @param exchanges Cambios de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = más nuevos primero).
 * @param onOrderingChange Se llama con el nuevo orden.
 * @param loading Muestra el esqueleto en lugar de las tarjetas.
 * @param dimmed Atenúa las tarjetas mientras se muestra la página anterior.
 * @param className Clases del contenedor.
 */
export function ExchangesCardList({
  exchanges,
  ordering,
  onOrderingChange,
  loading,
  dimmed,
  className,
}: {
  exchanges: Exchange[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  loading?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const descending = ordering === "" || ordering.startsWith("-");
  const field = ordering.replace(/^-/, "") || "created_at";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <span id="exchanges-order-label" className="text-sm font-medium">
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
            aria-labelledby="exchanges-order-label"
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
          <span className="sr-only">Cargando cambios…</span>
          <UsersListSkeleton count={4} />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2",
            dimmed && "opacity-60",
          )}
        >
          {exchanges.map((x) => (
            <EntityCard
              key={x.id}
              className={cn(x.status === "anulada" && "opacity-70")}
              title={`Cambio #${x.id}`}
              subtitle={`${formatDateTime(x.created_at)} · ${documentUser(x)}`}
              badge={<DocStatusBadge status={x.status} />}
              details={[
                { label: "Venta", value: `#${x.sale}` },
                {
                  label: "Cliente",
                  value: x.client_name ?? "Consumidor final",
                },
                { label: "Devuelve", value: formatSaleMoney(x.returned_total) },
                { label: "Se lleva", value: formatSaleMoney(x.new_total) },
                {
                  label: "Diferencia",
                  value: (
                    <ExchangeDifference
                      difference={x.difference}
                      unreturnedAmount={x.unreturned_amount}
                      paymentMethod={x.payment_method}
                    />
                  ),
                },
              ]}
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  render={<Link to={exchangePath(x.id)} />}
                  nativeButton={false}
                  aria-label={`Ver detalle del cambio ${x.id}`}
                >
                  Ver detalle
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
