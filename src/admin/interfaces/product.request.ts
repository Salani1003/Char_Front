/**
 * Cuerpo de `POST /products/`. Dinero como string decimal (`"90000.00"`),
 * fechas `YYYY-MM-DD`. Un producto no puede crearse publicado. `cost_price` se
 * ignora si el usuario no tiene `products.view_cost_price`. La promoción son
 * tres campos que van juntos o ninguno.
 */
export interface CreateProductRequest {
  name: string;
  category: number;
  sale_price: string;
  brand?: number;
  product_model?: number;
  description?: string;
  slug?: string;
  cost_price?: string;
  promo_price?: string;
  promo_start?: string;
  promo_end?: string;
}

/**
 * Cuerpo de `PATCH /products/:id/`: solo los campos a cambiar. Para quitar la
 * promoción enviar `promo_price`, `promo_start` y `promo_end` en `null`;
 * `brand`/`product_model` en `null` los vacían. `slug: ""` lo regenera desde el
 * nombre solo si el producto no está publicado. Publicar exige al menos una
 * variante activa.
 */
export type UpdateProductRequest = Partial<
  Omit<
    CreateProductRequest,
    "brand" | "product_model" | "promo_price" | "promo_start" | "promo_end"
  >
> & {
  is_published?: boolean;
  brand?: number | null;
  product_model?: number | null;
  promo_price?: string | null;
  promo_start?: string | null;
  promo_end?: string | null;
};
