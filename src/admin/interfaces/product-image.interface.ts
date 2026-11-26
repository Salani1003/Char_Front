/**
 * Foto tal como viene dentro de `GET /products/:id/with-variants/` (`images`):
 * es la fuente de la pestaña Imágenes. `url` es la foto completa y
 * `thumbnail_url` la miniatura 400×400; son URLs absolutas listas para usar
 * (no se modifican) y pueden ser `null` si el almacenamiento no está
 * configurado.
 */
export interface ProductImageItem {
  id: number;
  /** Id del color al que pertenece la foto. */
  color: number;
  url: string | null;
  thumbnail_url: string | null;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

/**
 * Foto completa de `/product-images/` (respuesta del `POST` y del `PATCH`).
 * `storage_key` es interno y no se expone.
 */
export interface ProductImage extends ProductImageItem {
  product: number;
  color_name: string;
  color_hex: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}
