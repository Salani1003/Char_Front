import { Badge } from "@/components/char/badge";
import {
  STOCK_COUNT_STATUS_LABELS,
  type StockCountStatus,
} from "../config/stock-counts";

const VARIANTS = {
  borrador: "warning",
  confirmado: "success",
  cancelado: "secondary",
} as const;

/**
 * Insignia del estado de un recuento: Borrador (se está armando, no toca el
 * stock), Confirmado (ya ajustó el stock) o Cancelado (descartado).
 *
 * @param status Estado del recuento.
 */
export function StockCountStatusBadge({
  status,
}: {
  status: StockCountStatus;
}) {
  return (
    <Badge variant={VARIANTS[status]}>
      {STOCK_COUNT_STATUS_LABELS[status]}
    </Badge>
  );
}
