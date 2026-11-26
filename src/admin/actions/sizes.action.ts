import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Size } from "../interfaces/size.interface";
import type { CreateSizeRequest } from "../interfaces/catalog.request";
import type { Paginated } from "../interfaces/paginated.interface";
import { getAllPages } from "../utils/getAllPages";
import { toSearchParams } from "../utils/toSearchParams";

/** Filtros de `GET /sizes/`; los vacíos no se envían. */
export interface GetSizesParams {
  page?: number;
  /** Hasta 100. */
  page_size?: number;
  search?: string;
}

/** Lista talles (`GET /sizes/`), ya ordenados por `order` por la API. */
export const getSizesAction = async (params: GetSizesParams = {}) => {
  const { data } = await charApi.get<Paginated<Size>>("/sizes/", {
    params: toSearchParams({ ...params }),
  });
  return data;
};

/** Todos los talles (recorre las páginas), en el orden de la API (`order`). */
export const getAllSizesAction = (
  params: Omit<GetSizesParams, "page" | "page_size"> = {},
) => getAllPages<Size>("/sizes/", { ...params });

/** Detalle de un talle (`GET /sizes/:id/`). */
export const getSizeAction = async (id: number) => {
  const { data } = await charApi.get<Size>(`/sizes/${id}/`);
  return data;
};

/**
 * Crea un talle (`POST /sizes/`; el backend lo guarda en MAYÚSCULAS). Con un
 * nombre repetido lanza un `ApiError` con `existing` (registro ya existente).
 */
export const createSizeAction = async (payload: CreateSizeRequest) => {
  try {
    const { data } = await charApi.post<Size>("/sizes/", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
