import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { ProductImage } from "../interfaces/product-image.interface";
import type {
  UpdateProductImageRequest,
  UploadProductImageRequest,
} from "../interfaces/product-image.request";

/**
 * Sube una foto (`POST /product-images/`, `multipart/form-data`). Arma un
 * `FormData` y **no fija el `Content-Type`**: el navegador agrega el
 * boundary (`charApi` no define headers por defecto, así que no hay nada que
 * lo pise). Informa el progreso (0–100) y se puede cancelar con `signal`.
 *
 * Lanza el error de axios **tal cual** (sin convertirlo) para que quien llama
 * distinga cancelación, 400, 502 y 503 con `classifyUploadError`.
 *
 * @param request Archivo y datos (`product`, `color`, `sort_order`, `is_primary`, `alt_text`).
 * @param options `signal` para cancelar y `onProgress` con el porcentaje subido.
 */
export const uploadProductImageAction = async (
  request: UploadProductImageRequest,
  options: {
    signal?: AbortSignal;
    onProgress?: (percent: number) => void;
  } = {},
) => {
  const body = new FormData();
  body.append("file", request.file);
  body.append("product", String(request.product));
  body.append("color", String(request.color));
  body.append("sort_order", String(request.sort_order));
  body.append("is_primary", String(request.is_primary));
  if (request.alt_text) body.append("alt_text", request.alt_text);
  const { data } = await charApi.post<ProductImage>("/product-images/", body, {
    signal: options.signal,
    onUploadProgress: (event) => {
      if (event.progress !== undefined) {
        options.onProgress?.(Math.round(event.progress * 100));
      }
    },
  });
  return data;
};

/** Edita una foto (`PATCH /product-images/:id/`, JSON). Si falla lanza un `ApiError`. */
export const updateProductImageAction = async (
  id: number,
  payload: UpdateProductImageRequest,
) => {
  try {
    const { data } = await charApi.patch<ProductImage>(
      `/product-images/${id}/`,
      payload,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

/**
 * Elimina una foto (`DELETE /product-images/:id/` → 204). Borra también el
 * archivo del servidor de imágenes y no se puede deshacer. Si falla lanza un
 * `ApiError` (su `cause` conserva el estado HTTP: 502 = falló el servidor de
 * imágenes y la foto **no** se eliminó; 503 = almacenamiento sin configurar).
 */
export const deleteProductImageAction = async (id: number) => {
  try {
    await charApi.delete(`/product-images/${id}/`);
  } catch (error) {
    throw toApiError(error);
  }
};
