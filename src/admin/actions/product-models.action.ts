import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { ProductModel } from "../interfaces/product-model.interface";
import type { CreateProductModelRequest } from "../interfaces/catalog.request";
import type { Paginated } from "../interfaces/paginated.interface";
import { getAllPages } from "../utils/getAllPages";
import { toSearchParams } from "../utils/toSearchParams";

/** Filtros de `GET /product-models/`; los vacíos no se envían. */
export interface GetProductModelsParams {
  page?: number;
  /** Hasta 100. */
  page_size?: number;
  search?: string;
  /** Solo los modelos de esta marca. */
  brand?: number;
}

/** Lista modelos (`GET /product-models/`), ya ordenados alfabéticamente por la API. */
export const getProductModelsAction = async (
  params: GetProductModelsParams = {},
) => {
  const { data } = await charApi.get<Paginated<ProductModel>>(
    "/product-models/",
    { params: toSearchParams({ ...params }) },
  );
  return data;
};

/** Todos los modelos que cumplen el filtro (recorre las páginas), en el orden de la API. */
export const getAllProductModelsAction = (
  params: Omit<GetProductModelsParams, "page" | "page_size"> = {},
) => getAllPages<ProductModel>("/product-models/", { ...params });

/** Detalle de un modelo (`GET /product-models/:id/`). */
export const getProductModelAction = async (id: number) => {
  const { data } = await charApi.get<ProductModel>(`/product-models/${id}/`);
  return data;
};

/**
 * Crea un modelo (`POST /product-models/`). Con un nombre repetido dentro de
 * la marca lanza un `ApiError` con `existing` (registro ya existente).
 */
export const createProductModelAction = async (
  payload: CreateProductModelRequest,
) => {
  try {
    const { data } = await charApi.post<ProductModel>(
      "/product-models/",
      payload,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
