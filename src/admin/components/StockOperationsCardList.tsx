import { Link } from "react-router";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
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
import { StockKindBadge } from "./StockKindBadge";
import { UsersListSkeleton } from "./UsersListSkeleton";
import {
  formatDateTime,
  operationUser,
  operationDetailPath,
} from "../utils/stock";
import type { StockOperation } from "../interfaces/stock-operation.interface";

/** Campos de orden y su etiqueta (claves = campos de la API). */
const ORDER_FIELDS: Record<string, string> = {
  created_at: "Fecha",
  units: "Unidades",
  lines_count: "Variantes",
};

/**
 * Historial en tarjetas para celulares: alternativa a `StockOperationsTable`.
 * Incluye "Ordenar por" y un botón asc/desc porque no hay encabezados donde
 * hacer clic. Sin orden elegido el campo aparece como "Fecha" descendente
 * (más nuevas primero, el orden del backend).
 *
 * @param operations Operaciones de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = más nuevas primero).
 * @param onOrderingChange Se llama con el nuevo orden.
 * @param loading Muestra el esqueleto en lugar de las tarjetas.
 * @param dimmed Atenúa las tarjetas mientras se muestra la página anterior.
 * @param className Clases del contenedor.
 */
export function StockOperationsCardList({
  operations,
  ordering,
  onOrderingChange,
  loading,
  dimmed,
  className,
}: {
  operations: StockOperation[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  loading?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const canViewCounts = useCan()(PERMISSIONS.stock.count.view);
  const descending = ordering === "" || ordering.startsWith("-");
  const field = ordering.replace(/^-/, "") || "created_at";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <span id="operations-order-label" className="text-sm font-medium">
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
            aria-labelledby="operations-order-label"
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
          <span className="sr-only">Cargando operaciones…</span>
          <UsersListSkeleton count={4} />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2",
            dimmed && "opacity-60",
          )}
        >
          {operations.map((o) => (
            <EntityCard
              key={o.id}
              title={`${o.kind_display} #${o.id}`}
              subtitle={`${formatDateTime(o.created_at)} · ${operationUser(o)}`}
              badge={<StockKindBadge kind={o.kind} />}
              details={[
                {
                  label: "Motivo",
                  value: o.reason_display,
                },
                { label: "Variantes", value: o.lines_count },
                { label: "Unidades", value: o.units },
                ...(o.note ? [{ label: "Nota", value: o.note }] : []),
              ]}
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  render={<Link to={operationDetailPath(o, canViewCounts)} />}
                  nativeButton={false}
                  aria-label={`Ver detalle de la operación ${o.id}`}
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
