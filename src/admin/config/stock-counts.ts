/** Estado de un recuento: `borrador` (editable, no toca el stock), `confirmado` y `cancelado` (congelados). */
export type StockCountStatus = "borrador" | "confirmado" | "cancelado";

export const STOCK_COUNT_STATUS_LABELS: Record<StockCountStatus, string> = {
  borrador: "Borrador",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

export const STOCK_COUNT_STATUS_OPTIONS = (
  Object.keys(STOCK_COUNT_STATUS_LABELS) as StockCountStatus[]
).map((value) => ({ value, label: STOCK_COUNT_STATUS_LABELS[value] }));
