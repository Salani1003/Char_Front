import type { ManualStockKind } from "../config/stock-operations";

/** Cuerpo de `POST /stock-operations/` (todo o nada: si una línea falla no se aplica ninguna). */
export interface CreateStockOperationRequest {
  kind: ManualStockKind;
  reason: string;
  note?: string;
  items: { variant: number; quantity: number }[];
}
