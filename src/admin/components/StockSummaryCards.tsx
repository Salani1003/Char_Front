import { Skeleton } from "@/components/char/skeleton";
import { cn } from "@/lib/utils";
import type { StockStatus } from "../actions/stock.action";
import type { StockSummary } from "../interfaces/stock.interface";

const CARDS: {
  status: StockStatus;
  label: string;
  value: (summary: StockSummary) => number;
  tone?: string;
}[] = [
  { status: "all", label: "Variantes", value: (s) => s.variants },
  {
    status: "out",
    label: "Sin stock",
    value: (s) => s.out_of_stock,
    tone: "text-danger",
  },
  {
    status: "low",
    label: "Stock bajo",
    value: (s) => s.low_stock,
    tone: "text-warning",
  },
  {
    status: "in",
    label: "Unidades · ver con stock",
    value: (s) => s.units,
  },
];

/**
 * Tarjetas de resumen de la pantalla de stock (`GET /stock/summary/`): total
 * de variantes, sin stock, con stock bajo y unidades. Los totales son de
 * **todas** las variantes activas (no respetan búsqueda ni filtros). Cada
 * tarjeta es un botón que filtra la grilla por ese estado (`aria-pressed`);
 * tocar la activa vuelve a "Variantes" (sin filtro de estado).
 *
 * @param summary Totales; `undefined` mientras carga (muestra esqueletos).
 * @param status Estado de la grilla elegido.
 * @param onStatusChange Se llama con el estado de la tarjeta tocada.
 */
export function StockSummaryCards({
  summary,
  status,
  onStatusChange,
}: {
  summary: StockSummary | undefined;
  status: StockStatus;
  onStatusChange: (status: StockStatus) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
        const pressed = status === card.status;
        return (
          <button
            key={card.status}
            type="button"
            aria-pressed={pressed}
            onClick={() => onStatusChange(pressed ? "all" : card.status)}
            className={cn(
              "flex flex-col gap-0.5 rounded-card bg-card px-4 py-3 text-left ring-1 ring-foreground/10 transition-shadow outline-none hover:ring-primary focus-visible:ring-3 focus-visible:ring-ring/50",
              pressed && "bg-accent ring-primary",
            )}
          >
            {summary ? (
              <span
                className={cn("text-2xl font-bold tabular-nums", card.tone)}
              >
                {card.value(summary)}
              </span>
            ) : (
              <Skeleton className="my-1 h-6 w-12" />
            )}
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </button>
        );
      })}
    </div>
  );
}
