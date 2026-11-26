import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Brand } from "../interfaces/brand.interface";
import type { CreateBrandRequest } from "../interfaces/catalog.request";
import type { Paginated } from "../interfaces/paginated.interface";
import { getAllPages } from "../utils/getAllPages";
import { toSearchParams } from "../utils/toSearchParams";

/** Filtros de `GET /brands/`; los vacíos no se envían. */
export interface GetBrandsParams {
  page?: number;
  /** Hasta 100. */
  page_size?: number;
  search?: string;
}

/** Lista marcas (`GET /brands/`), ya ordenadas alfabéticamente por la API. */
export const getBrandsAction = async (params: GetBrandsParams = {}) => {
  const { data } = await charApi.get<Paginated<Brand>>("/brands/", {
    params: toSearchParams({ ...params }),
  });
  return data;
};

/** Todas las marcas que cumplen el filtro (recorre las páginas), en el orden de la API. */
export const getAllBrandsAction = (
  params: Omit<GetBrandsParams, "page" | "page_size"> = {},
) => getAllPages<Brand>("/brands/", { ...params });

/** Detalle de una marca (`GET /brands/:id/`). */
export const getBrandAction = async (id: number) => {
  const { data } = await charApi.get<Brand>(`/brands/${id}/`);
  return data;
};

/**
 * Crea una marca (`POST /brands/`). Con un nombre repetido lanza un
 * `ApiError` con `existing` (registro ya existente).
 */
export const createBrandAction = async (payload: CreateBrandRequest) => {
  try {
    const { data } = await charApi.post<Brand>("/brands/", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
