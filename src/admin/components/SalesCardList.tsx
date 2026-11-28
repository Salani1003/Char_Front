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
import { UsersListSkeleton } from "./UsersListSkeleton";
import { formatSaleMoney, saleClientLabel } from "../config/sales";
import type { Sale } from "../interfaces/sale.interface";
import { formatDateTime } from "../utils/stock";
import { documentUser, salePath } from "../utils/sales";

/** Campos de orden y su etiqueta (claves = campos de la API). */
const ORDER_FIELDS: Record<string, string> = {
  created_at: "Fecha",
  total: "Total",
  id: "Número",
};

/**
 * Listado de ventas en tarjetas para celulares: alternativa a `SalesTable`.
 * Incluye "Ordenar por" y un botón asc/desc porque no hay encabezados donde
 * hacer clic. Sin orden elegido el campo aparece como "Fecha" descendente
 * (más nuevas primero, el orden del backend). Las anuladas se atenúan.
 *
 * @param sales Ventas de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = más nuevas primero).
 * @param onOrderingChange Se llama con el nuevo orden.
 * @param loading Muestra el esqueleto en lugar de las tarjetas.
 * @param dimmed Atenúa las tarjetas mientras se muestra la página anterior.
 * @param className Clases del contenedor.
 */
export function SalesCardList({
  sales,
  ordering,
  onOrderingChange,
  loading,
  dimmed,
  className,
}: {
  sales: Sale[];
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
        <span id="sales-order-label" className="text-sm font-medium">
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
            aria-labelledby="sales-order-label"
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
          <span className="sr-only">Cargando ventas…</span>
          <UsersListSkeleton count={4} />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2",
            dimmed && "opacity-60",
          )}
        >
          {sales.map((s) => (
            <EntityCard
              key={s.id}
              className={cn(s.status === "anulada" && "opacity-70")}
              title={`Venta #${s.id}`}
              subtitle={`${formatDateTime(s.created_at)} · ${documentUser(s)}`}
              badge={<DocStatusBadge status={s.status} />}
              details={[
                { label: "Cliente", value: saleClientLabel(s.client_name) },
                { label: "Unidades", value: s.units },
                { label: "Medio de pago", value: s.payment_method_display },
                ...(s.discount_percent
                  ? [{ label: "Descuento", value: `${s.discount_percent} %` }]
                  : []),
                { label: "Total", value: formatSaleMoney(s.total) },
              ]}
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  render={<Link to={salePath(s.id)} />}
                  nativeButton={false}
                  aria-label={`Ver detalle de la venta ${s.id}`}
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
