import type { Color } from "./color.interface";
import type { Size } from "./size.interface";

/**
 * Producto (`/products/`). Los nombres de categoría, marca y modelo ya vienen
 * resueltos. Los precios son strings decimales (`"90000.00"`) y las fechas
 * `YYYY-MM-DD`.
 */
export interface Product {
  id: number;
  name: string;
  slug: string;
  is_published: boolean;
  description: string;
  category: number;
  /** `"Vestidos › Largos"`. */
  category_label: string;
  brand: number | null;
  brand_name: string | null;
  product_model: number | null;
  product_model_name: string | null;
  /** Solo viene con el permiso `products.view_cost_price`; si no, no existe. */
  cost_price?: string;
  sale_price: string;
  promo_price: string | null;
  promo_start: string | null;
  promo_end: string | null;
  /** Calculado (solo lectura): precio de promo si está vigente, si no el de venta. */
  current_price: string;
  /** Calculado (solo lectura). */
  is_on_promo: boolean;
  created_at: string;
}

/** Variante dentro de `GET /products/:id/with-variants/`, con color y talle anidados. */
export interface ProductVariantItem {
  id: number;
  sku: string;
  color: Color;
  size: Size;
}

/** `GET /products/:id/with-variants/`: el producto más sus variantes activas (ordenadas por color y talle). */
export interface ProductWithVariants extends Product {
  variants: ProductVariantItem[];
}
