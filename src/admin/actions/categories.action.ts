import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Category } from "../interfaces/category.interface";
import type { CreateCategoryRequest } from "../interfaces/catalog.request";
import type { Paginated } from "../interfaces/paginated.interface";
import { getAllPages } from "../utils/getAllPages";
import { toSearchParams } from "../utils/toSearchParams";

/** Filtros de `GET /categories/`; los vacíos no se envían. */
export interface GetCategoriesParams {
  page?: number;
  /** Hasta 100. */
  page_size?: number;
  search?: string;
  /** Solo las subcategorías de esta principal. */
  parent?: number;
  /** `true` = solo principales; `false` = solo subcategorías. */
  root?: boolean;
  /** `true` = solo las asignables a productos (sin subcategorías). */
  leaf?: boolean;
}

/** Lista categorías (`GET /categories/`), ya ordenadas por la API (principal y luego sus subcategorías). */
export const getCategoriesAction = async (params: GetCategoriesParams = {}) => {
  const { data } = await charApi.get<Paginated<Category>>("/categories/", {
    params: toSearchParams({ ...params }),
  });
  return data;
};

/** Todas las categorías que cumplen el filtro (recorre las páginas), en el orden de la API. */
export const getAllCategoriesAction = (
  params: Omit<GetCategoriesParams, "page" | "page_size"> = {},
) => getAllPages<Category>("/categories/", { ...params });

/** Detalle de una categoría (`GET /categories/:id/`). */
export const getCategoryAction = async (id: number) => {
  const { data } = await charApi.get<Category>(`/categories/${id}/`);
  return data;
};

/**
 * Crea una categoría (`POST /categories/`). Con un nombre repetido lanza un
 * `ApiError` con `existing` (registro ya existente).
 */
export const createCategoryAction = async (payload: CreateCategoryRequest) => {
  try {
    const { data } = await charApi.post<Category>("/categories/", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
