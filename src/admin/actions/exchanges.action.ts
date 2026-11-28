import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Paginated } from "../interfaces/paginated.interface";
import type {
  Exchange,
  ExchangeDetail,
  ExchangePreviewResult,
} from "../interfaces/exchange.interface";
import type {
  CreateExchangeRequest,
  ExchangePreviewRequest,
  VoidRequest,
} from "../interfaces/sale.request";
import { toSearchParams, type QueryParamValue } from "../utils/toSearchParams";

export interface GetExchangesParams {
  page?: number;
  page_size?: number;
  /** Cliente, nota o SKU de las líneas. */
  search?: string;
  /** `created_at`, `difference` o `id` (prefijo `-` = descendente). */
  ordering?: string;
  sale?: number;
  client?: number;
  status?: string;
  payment_method?: string;
  created_by?: number;
  date_from?: string;
  date_to?: string;
}

/** Lista los cambios (`GET /exchanges/`, `sales.view_exchange`). */
export const getExchangesAction = async (params: GetExchangesParams = {}) => {
  const { data } = await charApi.get<Paginated<Exchange>>("/exchanges/", {
    params: toSearchParams({ page: 1, ...params } as Record<
      string,
      QueryParamValue
    >),
  });
  return data;
};

/** Un cambio con sus líneas (`GET /exchanges/:id/`). */
export const getExchangeAction = async (id: number) => {
  const { data } = await charApi.get<ExchangeDetail>(`/exchanges/${id}/`);
  return data;
};

/**
 * Calcula los totales de un cambio sin guardar nada (`POST /exchanges/preview/`,
 * `sales.add_exchange`). Devuelve los mismos 400 que el alta (plazo, cantidades,
 * stock): lanza un `ApiError`. Acepta una `AbortSignal` para descartar previews viejos.
 */
export const previewExchangeAction = async (
  payload: ExchangePreviewRequest,
  signal?: AbortSignal,
) => {
  try {
    const { data } = await charApi.post<ExchangePreviewResult>(
      "/exchanges/preview/",
      payload,
      { signal },
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

/** Registra un cambio (`POST /exchanges/`, `sales.add_exchange`). Lanza un `ApiError`. */
export const createExchangeAction = async (payload: CreateExchangeRequest) => {
  try {
    const { data } = await charApi.post<ExchangeDetail>("/exchanges/", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

/** Anula un cambio (`POST /exchanges/:id/void/`, `sales.void_exchange`). Motivo obligatorio. */
export const voidExchangeAction = async (id: number, payload: VoidRequest) => {
  try {
    const { data } = await charApi.post<ExchangeDetail>(
      `/exchanges/${id}/void/`,
      payload,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
