import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Paginated } from "../interfaces/paginated.interface";
import type {
  StockMovement,
  StockOperation,
  StockOperationDetail,
} from "../interfaces/stock-operation.interface";
import type { CreateStockOperationRequest } from "../interfaces/stock-operation.request";
import type { StockLevel } from "../interfaces/stock.interface";
import { toSearchParams, type QueryParamValue } from "../utils/toSearchParams";

export interface GetStockOperationsParams {
  page?: number;
  page_size?: number;
  /** Busca en la nota, el SKU o el producto de alguna línea. */
  search?: string;
  /** `created_at`, `units` o `lines_count` (prefijo `-` = descendente). */
  ordering?: string;
  kind?: string;
  reason?: string;
  /** `YYYY-MM-DD`, inclusivo (zona horaria del servidor, UTC). */
  date_from?: string;
  date_to?: string;
  /** Id de recuento: la operación que generó su confirmación. */
  stock_count?: number;
  /** Id de venta: la operación (egreso) que generó. */
  sale?: number;
  /** Id de cambio: las operaciones (ingreso y egreso) que generó. */
  exchange?: number;
}

/** Lista el historial (`GET /stock-operations/`, `stock.view_stockmovement`): una fila por operación. */
export const getStockOperationsAction = async (
  params: GetStockOperationsParams = {},
) => {
  const { data } = await charApi.get<Paginated<StockOperation>>(
    "/stock-operations/",
    {
      params: toSearchParams({ page: 1, ...params } as Record<
        string,
        QueryParamValue
      >),
    },
  );
  return data;
};

/** Una operación con todas sus líneas (`GET /stock-operations/:id/`). Un 404 llega como error de axios. */
export const getStockOperationAction = async (id: number) => {
  const { data } = await charApi.get<StockOperationDetail>(
    `/stock-operations/${id}/`,
  );
  return data;
};

/** Saldo de una sola variante (`GET /stock/:id/`). */
export const getStockLevelAction = async (variantId: number) => {
  const { data } = await charApi.get<StockLevel>(`/stock/${variantId}/`);
  return data;
};

/**
 * Registra un ingreso o egreso con todas sus líneas (`POST /stock-operations/`,
 * `stock.add_stockmovement`). Lanza un `ApiError` (stock insuficiente, motivo
 * que no corresponde, variante repetida, ...). No hay idempotencia: la
 * pantalla debe bloquear el reenvío mientras la request está en curso.
 */
export const createStockOperationAction = async (
  payload: CreateStockOperationRequest,
) => {
  try {
    const { data } = await charApi.post<StockOperationDetail>(
      "/stock-operations/",
      payload,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

/**
 * Anula una línea (`POST /stock-movements/:id/reverse/`): crea el movimiento
 * inverso en una operación nueva de una sola línea y lo devuelve (su
 * `operation` permite navegar a ella). Lanza un `ApiError` si ya fue anulada,
 * es un ajuste o ya no alcanza el saldo.
 */
export const reverseStockMovementAction = async (id: number) => {
  try {
    const { data } = await charApi.post<StockMovement>(
      `/stock-movements/${id}/reverse/`,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
