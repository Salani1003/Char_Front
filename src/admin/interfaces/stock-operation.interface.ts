import type { StockKind } from "../config/stock-operations";

/**
 * Operación de stock (`GET /stock-operations/`): el documento que agrupa los
 * movimientos hechos juntos (un ingreso/egreso en lote, un recuento
 * confirmado o una anulación). El listado no trae las líneas.
 */
export interface StockOperation {
  id: number;
  kind: StockKind;
  kind_display: string;
  reason: string;
  reason_display: string;
  note: string;
  /** Id del recuento que la originó, o `null`. */
  stock_count: number | null;
  /** Id de la venta que la generó, o `null`. Esas operaciones no se anulan por línea: se anula la venta. */
  sale: number | null;
  /** Id del cambio que la generó, o `null`. */
  exchange: number | null;
  /** Cantidad de variantes; 0 en un recuento sin diferencias. */
  lines_count: number;
  /** Unidades movidas: suma de los valores absolutos de las líneas. */
  units: number;
  created_at: string;
  created_by: number | null;
  /** `null` si el usuario se eliminó. */
  created_by_email: string | null;
}

/** Línea de una operación: el cambio de stock de **una** variante. */
export interface StockMovement {
  /** Id del movimiento (el que se usa para anular). */
  id: number;
  operation: number;
  variant: number;
  sku: string;
  product: number;
  product_name: string;
  color_name: string;
  size_name: string;
  kind: StockKind;
  kind_display: string;
  reason: string;
  reason_display: string;
  /** Con signo: `+5` suma, `-2` resta. */
  quantity: number;
  stock_before: number;
  stock_after: number;
  note: string;
  stock_count: number | null;
  /** Si es una anulación: id del movimiento anulado. */
  reverses: number | null;
  reverses_operation: number | null;
  /** Si fue anulada: id del movimiento que la anuló. */
  reversed_by: number | null;
  reversed_by_operation: number | null;
  created_at: string;
  created_by: number | null;
  created_by_email: string | null;
}

/** Operación con todas sus líneas (`GET /stock-operations/:id/`, sin paginar). */
export interface StockOperationDetail extends StockOperation {
  movements: StockMovement[];
}
