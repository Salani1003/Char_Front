import type {
  DocStatus,
  ExchangeDirection,
  PaymentMethod,
} from "../config/sales";

/** Cambio tal como sale en el listado (`GET /exchanges/`). */
export interface Exchange {
  id: number;
  sale: number;
  client: number | null;
  client_name: string | null;
  status: DocStatus;
  status_display: string;
  /** Valor de lo que devuelve (a lo que pagó). */
  returned_total: string;
  /** Valor de lo que se lleva (precio vigente). */
  new_total: string;
  /** `new − returned`; puede ser negativa (`"-60.00"`). */
  difference: string;
  /** `max(−difference, 0)`: valor que NO se reintegra. */
  unreturned_amount: string;
  /** `""` si no hubo diferencia a pagar. */
  payment_method: PaymentMethod | "";
  payment_method_display: string;
  note: string;
  created_at: string;
  created_by: number | null;
  created_by_email: string | null;
  voided_at: string | null;
  voided_by: number | null;
  voided_by_email: string | null;
  void_reason: string;
}

/** Línea de un cambio: lo que se devuelve (`in`) o se lleva (`out`). */
export interface ExchangeItem {
  id: number;
  direction: ExchangeDirection;
  direction_display: string;
  variant: number;
  sku: string;
  product: number;
  product_name: string;
  color_name: string;
  color_hex: string;
  size_name: string;
  quantity: number;
  /** Devuelve: lo que pagó · se lleva: precio vigente. */
  unit_price: string;
  subtotal: string;
  /** Solo en `in`. */
  sale_item: number | null;
}

/** Cambio con sus líneas (`GET /exchanges/:id/`). */
export interface ExchangeDetail extends Exchange {
  items: ExchangeItem[];
}

/** Resultado de `POST /exchanges/preview/` (no guarda nada). */
export interface ExchangePreviewResult {
  returned_total: string;
  new_total: string;
  difference: string;
  unreturned_amount: string;
}
