import { Badge } from "@/components/char/badge";
import { getStockState } from "../utils/stock";
import type { StockLevel } from "../interfaces/stock.interface";

const STATES = {
  out: { variant: "danger", label: "Sin stock" },
  low: { variant: "warning", label: "Stock bajo" },
  ok: { variant: "success", label: "En stock" },
} as const;

/**
 * Insignia del estado de una variante en la grilla de stock: "Sin stock"
 * (`quantity === 0`), "Stock bajo" (`is_low_stock`) o "En stock".
 *
 * @param level Saldo de la variante (usa `quantity` e `is_low_stock`).
 */
export function StockStatusBadge({
  level,
}: {
  level: Pick<StockLevel, "quantity" | "is_low_stock">;
}) {
  const { variant, label } = STATES[getStockState(level)];
  return <Badge variant={variant}>{label}</Badge>;
}
