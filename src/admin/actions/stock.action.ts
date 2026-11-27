import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Paginated } from "../interfaces/paginated.interface";
import type { StockLevel, StockSummary } from "../interfaces/stock.interface";
import { toSearchParams, type QueryParamValue } from "../utils/toSearchParams";

/** Filtros por id de la grilla de stock; cada clave es el parámetro de la API. */
export const STOCK_ID_FILTER_KEYS = [
  "category",
  "brand",
  "color",
  "size",
] as const;
export type StockIdFilterKey = (typeof STOCK_ID_FILTER_KEYS)[number];

/** Estado de stock elegido en las tarjetas de resumen; `all` no filtra. */
export type StockStatus = "all" | "in" | "out" | "low";

export interface GetStockParams {
  page?: number;
  page_size?: number;
  /** Busca en SKU, producto, marca, color y talle. */
  search?: string;
  /** Campo de orden; prefijo `-` = descendente. Vacío = orden del backend. */
  ordering?: string;
  status?: StockStatus;
  filters?: Partial<Record<StockIdFilterKey, string>>;
}

/** Parámetro de la API que implementa cada estado. */
const STATUS_PARAM: Record<Exclude<StockStatus, "all">, string> = {
  in: "in_stock",
  out: "out_of_stock",
  low: "low_stock",
};

/**
 * Lista los saldos (`GET /stock/`, permiso `stock.view_stocklevel`) con
 * paginación, búsqueda, orden y filtros. Los parámetros vacíos no se envían.
 */
export const getStockAction = async ({
  page = 1,
  page_size,
  search,
  ordering,
  status = "all",
  filters = {},
}: GetStockParams = {}) => {
  const query: Record<string, QueryParamValue> = {
    page,
    page_size,
    search,
    ordering,
    ...filters,
  };
  if (status !== "all") query[STATUS_PARAM[status]] = true;
  const { data } = await charApi.get<Paginated<StockLevel>>("/stock/", {
    params: toSearchParams(query),
  });
  return data;
};

/** Totales para las tarjetas de arriba (`GET /stock/summary/`). */
export const getStockSummaryAction = async () => {
  const { data } = await charApi.get<StockSummary>("/stock/summary/");
  return data;
};

/**
 * Cambia el stock mínimo de una variante (`PATCH /product-variants/:id/`,
 * permiso `products.change_productvariant`). Un valor inválido lanza un
 * `ApiError` con el mensaje del backend.
 */
export const updateMinStockAction = async (id: number, minStock: number) => {
  try {
    await charApi.patch(`/product-variants/${id}/`, { min_stock: minStock });
  } catch (error) {
    throw toApiError(error);
  }
};
