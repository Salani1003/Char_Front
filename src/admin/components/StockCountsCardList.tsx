import { Link } from "react-router";
import { Button } from "@/components/char/button";
import { EntityCard } from "@/components/char/entity-card";
import { cn } from "@/lib/utils";
import { StockCountStatusBadge } from "./StockCountStatusBadge";
import { UsersListSkeleton } from "./UsersListSkeleton";
import { formatDateTime, stockCountPath } from "../utils/stock";
import type { StockCount } from "../interfaces/stock-count.interface";

/**
 * Recuentos en tarjetas para celulares: alternativa a `StockCountsTable`.
 * Sin control de orden: usa el del backend (más nuevos primero) o el elegido
 * en la URL.
 *
 * @param counts Recuentos de la página actual.
 * @param loading Muestra el esqueleto en lugar de las tarjetas.
 * @param dimmed Atenúa las tarjetas mientras se muestra la página anterior.
 * @param className Clases del contenedor.
 */
export function StockCountsCardList({
  counts,
  loading,
  dimmed,
  className,
}: {
  counts: StockCount[];
  loading?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  if (loading) {
    return (
      <div role="status" className={className}>
        <span className="sr-only">Cargando recuentos…</span>
        <UsersListSkeleton count={4} />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid gap-4 transition-opacity sm:grid-cols-2",
        dimmed && "opacity-60",
        className,
      )}
    >
      {counts.map((c) => (
        <EntityCard
          key={c.id}
          title={`Recuento #${c.id}`}
          subtitle={c.note || "Sin nota"}
          badge={<StockCountStatusBadge status={c.status} />}
          details={[
            { label: "Líneas", value: c.items_count },
            { label: "Creado", value: formatDateTime(c.created_at) },
            ...(c.confirmed_at
              ? [{ label: "Confirmado", value: formatDateTime(c.confirmed_at) }]
              : []),
          ]}
          actions={
            <Button
              variant="secondary"
              size="sm"
              render={<Link to={stockCountPath(c.id)} />}
              nativeButton={false}
              aria-label={`Ver el recuento ${c.id}`}
            >
              {c.status === "borrador" ? "Continuar" : "Ver"}
            </Button>
          }
        />
      ))}
    </div>
  );
}
