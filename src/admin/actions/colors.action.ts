import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Color } from "../interfaces/color.interface";
import type { CreateColorRequest } from "../interfaces/catalog.request";
import type { Paginated } from "../interfaces/paginated.interface";
import { getAllPages } from "../utils/getAllPages";
import { toSearchParams } from "../utils/toSearchParams";

/** Filtros de `GET /colors/`; los vacíos no se envían. */
export interface GetColorsParams {
  page?: number;
  /** Hasta 100. */
  page_size?: number;
  search?: string;
}

/** Lista colores (`GET /colors/`), ya ordenados alfabéticamente por la API. */
export const getColorsAction = async (params: GetColorsParams = {}) => {
  const { data } = await charApi.get<Paginated<Color>>("/colors/", {
    params: toSearchParams({ ...params }),
  });
  return data;
};

/** Todos los colores (recorre las páginas), en el orden de la API. */
export const getAllColorsAction = (
  params: Omit<GetColorsParams, "page" | "page_size"> = {},
) => getAllPages<Color>("/colors/", { ...params });

/** Detalle de un color (`GET /colors/:id/`). */
export const getColorAction = async (id: number) => {
  const { data } = await charApi.get<Color>(`/colors/${id}/`);
  return data;
};

/**
 * Crea un color (`POST /colors/`). Sin tono hay que omitir `hex`. Con un
 * nombre repetido lanza un `ApiError` con `existing` (registro ya existente).
 */
export const createColorAction = async (payload: CreateColorRequest) => {
  try {
    const { data } = await charApi.post<Color>("/colors/", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
