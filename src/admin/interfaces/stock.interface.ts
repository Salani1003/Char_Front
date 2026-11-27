/**
 * Saldo de una variante activa tal como lo devuelve `GET /stock/`. Una fila
 * por variante, tenga o no movimientos. `id` es el **id de la variante** (el
 * que se usa en el resto de la API de stock y en `PATCH /product-variants/:id/`).
 */
export interface StockLevel {
  id: number;
  sku: string;
  product: number;
  product_name: string;
  category_label: string;
  brand_name: string | null;
  color: number;
  color_name: string;
  /** Color en hexadecimal (`#14284B`); puede venir vacío. */
  color_hex: string;
  size: number;
  size_name: string;
  /** Stock actual; nunca negativo. */
  quantity: number;
  /** Umbral de reposición; 0 = sin alerta. */
  min_stock: number;
  /**
   * Foto principal del color de la variante y su miniatura 400×400. Los
   * agrega el backend a `/stock/` solo si la persona puede ver imágenes
   * (`products.view_productimage`); pueden faltar o ser `null`.
   */
  image_url?: string | null;
  thumbnail_url?: string | null;
  /** `min_stock > 0` y `quantity <= min_stock` (incluye las agotadas con mínimo). */
  is_low_stock: boolean;
}

/** Totales de todas las variantes activas (`GET /stock/summary/`); no respeta filtros. */
export interface StockSummary {
  variants: number;
  out_of_stock: number;
  low_stock: number;
  units: number;
}
