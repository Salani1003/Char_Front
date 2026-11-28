import type {
  DiscountPercent,
  DocStatus,
  PaymentMethod,
} from "../config/sales";

/** Venta tal como sale en el listado (`GET /sales/`). Importes como string con 2 decimales. */
export interface Sale {
  id: number;
  client: number | null;
  /** Sigue apareciendo si el cliente se eliminó después. */
  client_name: string | null;
  payment_method: PaymentMethod;
  payment_method_display: string;
  /** A precio de lista, sin descuento. */
  subtotal: string;
  discount_percent: DiscountPercent;
  discount_reason: string;
  /** Lo cobrado. */
  total: string;
  note: string;
  status: DocStatus;
  status_display: string;
  /** Variantes distintas. */
  items_count: number;
  /** Unidades totales. */
  units: number;
  /** `YYYY-MM-DD`: último día para cambiar. */
  exchange_deadline: string;
  created_at: string;
  created_by: number | null;
  created_by_email: string | null;
  voided_at: string | null;
  voided_by: number | null;
  voided_by_email: string | null;
  void_reason: string;
}

/** Ítem de una venta; su `id` es el `sale_item` que se manda al crear un cambio. */
export interface SaleItem {
  id: number;
  variant: number;
  sku: string;
  product: number;
  product_name: string;
  color_name: string;
  color_hex: string;
  size_name: string;
  quantity: number;
  /** Precio vigente al vender. */
  list_price: string;
  discount_percent: number;
  /** Lo que pagó por unidad (lo que vale al devolverlo). */
  unit_price: string;
  /** `unit_price × quantity`. */
  subtotal: string;
  exchanged_quantity: number;
  /** `quantity − exchanged_quantity`. */
  exchangeable_quantity: number;
}

/** Resumen de un cambio dentro del detalle de la venta. */
export interface ExchangeSummary {
  id: number;
  status: DocStatus;
  returned_total: string;
  new_total: string;
  difference: string;
  payment_method: PaymentMethod | "";
  created_at: string;
}

/** Venta con sus ítems y cambios (`GET /sales/:id/`). */
export interface SaleDetail extends Sale {
  /** Completada + dentro del plazo + unidades por cambiar. */
  can_exchange: boolean;
  items: SaleItem[];
  exchanges: ExchangeSummary[];
}
