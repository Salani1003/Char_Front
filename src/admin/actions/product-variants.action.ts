import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { CreatedProductVariant } from "../interfaces/product-variant.interface";
import type { CreateProductVariantRequest } from "../interfaces/product-variant.request";

/**
 * Crea una variante (`POST /product-variants/`; el SKU lo asigna el backend).
 * Si la combinación producto + color + talle ya existe lanza un `ApiError`
 * (`non_field_errors`).
 */
export const createProductVariantAction = async (
  payload: CreateProductVariantRequest,
) => {
  try {
    const { data } = await charApi.post<CreatedProductVariant>(
      "/product-variants/",
      payload,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

/**
 * Elimina una variante (`DELETE /product-variants/:id/`, borrado lógico). No
 * se puede eliminar la última de un producto publicado: el `ApiError` trae el
 * mensaje del backend.
 */
export const deleteProductVariantAction = async (id: number) => {
  try {
    await charApi.delete(`/product-variants/${id}/`);
  } catch (error) {
    throw toApiError(error);
  }
};
