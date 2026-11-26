/** Cuerpo de `POST /product-variants/`. La combinación producto + color + talle no puede repetirse. */
export interface CreateProductVariantRequest {
  product: number;
  color: number;
  size: number;
}
