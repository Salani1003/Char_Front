/**
 * Variante de producto (producto + color + talle) tal como la devuelve
 * `GET /product-variants/`. Ya trae nombres y precios resueltos. Los precios
 * son strings decimales (`"150.00"`). No incluye costo ni stock.
 */
export interface ProductVariant {
  id: number;
  sku: string;
  created_at: string;
  product: number;
  product_name: string;
  is_published: boolean;
  category: number;
  category_label: string;
  brand: number | null;
  brand_name: string | null;
  product_model: number | null;
  product_model_name: string | null;
  color: number;
  color_name: string;
  /** Color en hexadecimal (`#14284B`). */
  color_hex: string;
  size: number;
  size_name: string;
  sale_price: string;
  promo_price: string | null;
  /** `YYYY-MM-DD`. */
  promo_start: string | null;
  /** `YYYY-MM-DD`. */
  promo_end: string | null;
  /** Precio vigente hoy: el de promo si está en rango, si no el de venta. */
  current_price: string;
  is_on_promo: boolean;
  /** Foto completa del color de la variante (la principal o, si no hay, la de menor orden); `null` si no tiene. */
  image_url: string | null;
  /** Miniatura 400×400 de esa misma foto; `null` si no tiene. */
  thumbnail_url: string | null;
}

/** Elemento de los catálogos auxiliares (categorías, marcas, modelos, colores, talles). */
export interface CatalogLookup {
  id: number;
  name: string;
  /** Solo las categorías: ruta completa ("Vestidos › Largos"). */
  label?: string;
}

/**
 * Variante tal como la devuelve `POST /product-variants/` (id de producto,
 * color y talle sin resolver). No confundir con `ProductVariant`, la fila de
 * la grilla de listado.
 */
export interface CreatedProductVariant {
  id: number;
  product: number;
  color: number;
  size: number;
  /** Lo asigna el backend (`CHAR-0001`…); solo lectura. */
  sku: string;
  created_at: string;
}
