import { Link } from "react-router";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { cn } from "@/lib/utils";
import { stockOperationPath } from "../utils/stock";
import type { StockMovement } from "../interfaces/stock-operation.interface";

/** Texto con signo de una cantidad: `+5`, `−2`. */
const signed = (quantity: number) =>
  `${quantity > 0 ? "+" : "−"}${Math.abs(quantity)}`;

/**
 * Líneas de una operación (`StockOperationPage`): variante (producto y color),
 * SKU, talle, cantidad con signo (verde suma, rojo resta), stock antes y
 * después y el estado de la línea: "Anulada" con enlace a la operación que la
 * anuló, "Anula la operación #N" si es una anulación, o el botón "Anular
 * línea" cuando `canReverse(línea)` es verdadero.
 *
 * @param movements Líneas de la operación.
 * @param canReverse Decide si una línea muestra "Anular línea".
 * @param onReverse Se llama con la línea a anular.
 */
export function StockMovementsTable({
  movements,
  canReverse,
  onReverse,
}: {
  movements: StockMovement[];
  canReverse: (movement: StockMovement) => boolean;
  onReverse: (movement: StockMovement) => void;
}) {
  const columns: DataTableColumn<StockMovement>[] = [
    {
      key: "product",
      header: "Variante",
      cell: (m) => (
        <div className="flex flex-col">
          <span className="font-medium">{m.product_name}</span>
          <span className="text-xs text-muted-foreground">{m.color_name}</span>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      cell: (m) => <span className="font-mono text-xs">{m.sku}</span>,
    },
    { key: "size", header: "Talle", cell: (m) => m.size_name },
    {
      key: "quantity",
      header: "Cantidad",
      align: "right",
      cell: (m) => (
        <span
          className={cn(
            "font-bold tabular-nums",
            m.quantity > 0 ? "text-success" : "text-danger",
          )}
        >
          {signed(m.quantity)}
        </span>
      ),
    },
    {
      key: "before",
      header: "Stock antes",
      align: "right",
      cell: (m) => <span className="tabular-nums">{m.stock_before}</span>,
    },
    {
      key: "after",
      header: "Stock después",
      align: "right",
      cell: (m) => (
        <span className="font-bold tabular-nums">{m.stock_after}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (m) => {
        if (m.reversed_by !== null) {
          return (
            <span className="inline-flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Anulada</Badge>
              {m.reversed_by_operation !== null ? (
                <Link
                  to={stockOperationPath(m.reversed_by_operation)}
                  className="rounded-sm text-xs underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Ver operación #{m.reversed_by_operation}
                </Link>
              ) : null}
            </span>
          );
        }
        if (m.reverses_operation !== null) {
          return (
            <Link
              to={stockOperationPath(m.reverses_operation)}
              className="rounded-sm text-xs underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Anula la operación #{m.reverses_operation}
            </Link>
          );
        }
        return canReverse(m) ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onReverse(m)}
            aria-label={`Anular la línea de ${m.sku}`}
          >
            Anular línea
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <DataTable
      caption="Líneas de la operación"
      columns={columns}
      rows={movements}
      getRowKey={(m) => m.id}
    />
  );
}
