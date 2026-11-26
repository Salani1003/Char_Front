import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type {
  Product,
  ProductWithVariants,
} from "../interfaces/product.interface";
import type {
  CreateProductRequest,
  UpdateProductRequest,
} from "../interfaces/product.request";

/** Detalle de un producto (`GET /products/:id/`). `cost_price` solo viene con `products.view_cost_price`. */
export const getProductAction = async (id: number) => {
  const { data } = await charApi.get<Product>(`/products/${id}/`);
  return data;
};

/**
 * Producto con sus variantes activas (`GET /products/:id/with-variants/`;
 * exige además `products.view_productvariant`). Las variantes ya vienen
 * ordenadas por color y talle.
 */
export const getProductWithVariantsAction = async (id: number) => {
  const { data } = await charApi.get<ProductWithVariants>(
    `/products/${id}/with-variants/`,
  );
  return data;
};

/** Crea un producto (`POST /products/`; no puede crearse publicado). Si falla lanza un `ApiError`. */
export const createProductAction = async (payload: CreateProductRequest) => {
  try {
    const { data } = await charApi.post<Product>("/products/", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

/**
 * Edita un producto (`PATCH /products/:id/`) enviando solo los campos
 * pasados. Si falla lanza un `ApiError` (ej. publicar sin variantes).
 */
export const updateProductAction = async (
  id: number,
  payload: UpdateProductRequest,
) => {
  try {
    const { data } = await charApi.patch<Product>(`/products/${id}/`, payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

/** Elimina un producto (`DELETE /products/:id/`, borrado lógico → 204). Si falla lanza un `ApiError`. */
export const deleteProductAction = async (id: number) => {
  try {
    await charApi.delete(`/products/${id}/`);
  } catch (error) {
    throw toApiError(error);
  }
};
