/**
 * Cuerpo de `PATCH /product-images/:id/` (JSON): solo los campos que cambian.
 * No se puede reemplazar el archivo ni cambiar el producto.
 */
export interface UpdateProductImageRequest {
  alt_text?: string;
  sort_order?: number;
  color?: number;
  is_primary?: boolean;
}

/** Datos de una subida (`POST /product-images/`, multipart; una foto por request). */
export interface UploadProductImageRequest {
  file: File;
  product: number;
  /** Obligatorio: las fotos son del producto en un color. */
  color: number;
  sort_order: number;
  is_primary: boolean;
  alt_text?: string;
}
