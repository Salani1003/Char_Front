import type { DiscountPercent, PaymentMethod } from "../config/sales";

/** Body de `POST /sales/`. Nunca lleva precios: los calcula el backend. */
export interface CreateSaleRequest {
  items: { variant: number; quantity: number }[];
  payment_method: PaymentMethod;
  /** `null`/ausente = consumidor final. */
  client?: number | null;
  discount_percent?: DiscountPercent;
  discount_reason?: string;
  note?: string;
  /** Un UUID por intento de cobro: evita duplicar la venta ante doble clic o reintento. */
  idempotency_key?: string;
}

/** Body de `POST /sales/:id/void/` y `POST /exchanges/:id/void/`. */
export interface VoidRequest {
  reason: string;
}

/** Body de `POST /exchanges/preview/` (y del alta, que suma `payment_method` y `note`). */
export interface ExchangePreviewRequest {
  sale: number;
  returned_items: { sale_item: number; quantity: number }[];
  new_items?: { variant: number; quantity: number }[];
}

/** Body de `POST /exchanges/`. */
export interface CreateExchangeRequest extends ExchangePreviewRequest {
  /** Obligatorio solo si la diferencia es mayor a 0. */
  payment_method?: PaymentMethod;
  note?: string;
}
