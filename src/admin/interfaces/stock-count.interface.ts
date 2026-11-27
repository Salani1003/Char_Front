import type { StockCountStatus } from "../config/stock-counts";

/** Recuento tal como lo devuelve `GET /stock-counts/` (sin líneas). */
export interface StockCount {
  id: number;
  status: StockCountStatus;
  status_display: string;
  note: string;
  items_count: number;
  created_at: string;
  created_by: number | null;
  created_by_email: string | null;
  confirmed_at: string | null;
  confirmed_by: number | null;
  confirmed_by_email: string | null;
}

/** Línea de un recuento: lo **contado** de una variante. */
export interface StockCountItem {
  id: number;
  variant: number;
  sku: string;
  product_name: string;
  color_name: string;
  size_name: string;
  /** Lo contado (entero ≥ 0). */
  counted_quantity: number;
  /** Saldo del sistema al confirmar; `null` mientras es borrador. */
  system_quantity: number | null;
  /** `counted - system` al confirmar; `null` mientras es borrador. */
  difference: number | null;
}

/** Recuento con sus líneas (`GET /stock-counts/:id/`). */
export interface StockCountDetail extends StockCount {
  items: StockCountItem[];
}
