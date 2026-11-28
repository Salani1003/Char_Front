import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Paginated } from "../interfaces/paginated.interface";
import type { Sale, SaleDetail } from "../interfaces/sale.interface";
import type {
  CreateSaleRequest,
  VoidRequest,
} from "../interfaces/sale.request";
import { toSearchParams, type QueryParamValue } from "../utils/toSearchParams";

export interface GetSalesParams {
  page?: number;
  page_size?: number;
  /** Cliente (nombre, apellido, email), nota o SKU de los ítems. */
  search?: string;
  /** `created_at`, `total` o `id` (prefijo `-` = descendente; por defecto `-created_at`). */
  ordering?: string;
  status?: string;
  payment_method?: string;
  client?: number;
  created_by?: number;
  product?: number;
  variant?: number;
  /** `true` / `false`. */
  has_discount?: string;
  /** `true` / `false`: con algún cambio **activo**. */
  has_exchanges?: string;
  min_total?: string;
  max_total?: string;
  /** `YYYY-MM-DD`, inclusivos, día de Buenos Aires. */
  date_from?: string;
  date_to?: string;
}

/** Lista las ventas (`GET /sales/`, `sales.view_sale`). */
export const getSalesAction = async (params: GetSalesParams = {}) => {
  const { data } = await charApi.get<Paginated<Sale>>("/sales/", {
    params: toSearchParams({ page: 1, ...params } as Record<
      string,
      QueryParamValue
    >),
  });
  return data;
};

/** Una venta con ítems y cambios (`GET /sales/:id/`). Un 404 llega como error de axios. */
export const getSaleAction = async (id: number) => {
  const { data } = await charApi.get<SaleDetail>(`/sales/${id}/`);
  return data;
};

/**
 * Registra una venta (`POST /sales/`, `sales.add_sale`; con descuento también
 * `sales.apply_discount`). Responde 201, o 200 con la venta original si la
 * `idempotency_key` ya existía: ambos son éxito. Lanza un `ApiError` (sin
 * stock con `variant`/`available`/`requested`, descuento, cliente, ...).
 */
export const createSaleAction = async (payload: CreateSaleRequest) => {
  try {
    const { data } = await charApi.post<SaleDetail>("/sales/", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

/** Anula una venta y devuelve el stock (`POST /sales/:id/void/`, `sales.void_sale`). Motivo obligatorio. */
export const voidSaleAction = async (id: number, payload: VoidRequest) => {
  try {
    const { data } = await charApi.post<SaleDetail>(
      `/sales/${id}/void/`,
      payload,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
