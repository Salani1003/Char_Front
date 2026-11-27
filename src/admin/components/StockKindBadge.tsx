import { Badge } from "@/components/char/badge";
import { STOCK_KIND_LABELS, type StockKind } from "../config/stock-operations";

const VARIANTS = {
  ingreso: "success",
  egreso: "danger",
  ajuste: "primary",
} as const;

/**
 * Insignia del tipo de una operación de stock: Ingreso (verde), Egreso (rojo)
 * o Ajuste (color de marca; lo genera un recuento).
 *
 * @param kind Tipo de la operación.
 */
export function StockKindBadge({ kind }: { kind: StockKind }) {
  return <Badge variant={VARIANTS[kind]}>{STOCK_KIND_LABELS[kind]}</Badge>;
}
