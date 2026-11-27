import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Paginated } from "../interfaces/paginated.interface";
import type {
  StockCount,
  StockCountDetail,
} from "../interfaces/stock-count.interface";
import type { StockLevel } from "../interfaces/stock.interface";
import { getAllPages } from "../utils/getAllPages";
import { toSearchParams, type QueryParamValue } from "../utils/toSearchParams";

export interface GetStockCountsParams {
  page?: number;
  page_size?: number;
  /** Busca en la nota. */
  search?: string;
  /** `created_at` o `confirmed_at` (prefijo `-` = descendente). */
  ordering?: string;
  status?: string;
  /** `YYYY-MM-DD`, fecha de creación, inclusivo (UTC). */
  date_from?: string;
  date_to?: string;
}

/** Lista los recuentos (`GET /stock-counts/`, `stock.view_stockcount`), sin líneas. */
export const getStockCountsAction = async (
  params: GetStockCountsParams = {},
) => {
  const { data } = await charApi.get<Paginated<StockCount>>("/stock-counts/", {
    params: toSearchParams({ page: 1, ...params } as Record<
      string,
      QueryParamValue
    >),
  });
  return data;
};

/** Un recuento con sus líneas (`GET /stock-counts/:id/`). Un 404 llega como error de axios. */
export const getStockCountAction = async (id: number) => {
  const { data } = await charApi.get<StockCountDetail>(`/stock-counts/${id}/`);
  return data;
};

/**
 * Todos los saldos (recorre `GET /stock/` de a 100). El recuento en borrador
 * no trae el saldo actual de cada línea: se cruza con esta lista ("En sistema
 * hoy"), y "Cargar todas las variantes" parte de ella.
 */
export const getAllStockLevelsAction = () => getAllPages<StockLevel>("/stock/");

/** Una línea a guardar: la variante y lo contado. */
export interface StockCountItemInput {
  variant: number;
  counted_quantity: number;
}

/** Crea un recuento en borrador (`POST /stock-counts/`, `stock.add_stockcount`) con nota y líneas opcionales. */
export const createStockCountAction = async (
  payload: { note?: string; items?: StockCountItemInput[] } = {},
) => {
  try {
    const { data } = await charApi.post<StockCountDetail>(
      "/stock-counts/",
      payload,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

/**
 * Guarda los cambios de un borrador y devuelve el recuento actualizado: quita
 * las líneas que ya no están (`DELETE …/items/:variant/`), agrega o corrige
 * las nuevas y las cambiadas en un solo `POST …/items/bulk/` y, si cambió,
 * actualiza la nota (`PATCH`). Las líneas no mencionadas quedan como están.
 * No es atómico entre pasos: ante un error lanza un `ApiError` y lo ya
 * aplicado queda guardado (la pantalla vuelve a pedir el recuento).
 */
export const saveStockCountDraftAction = async ({
  id,
  removed,
  upserts,
  note,
}: {
  id: number;
  removed: number[];
  upserts: StockCountItemInput[];
  note?: string;
}) => {
  try {
    await Promise.all(
      removed.map((variant) =>
        charApi.delete(`/stock-counts/${id}/items/${variant}/`),
      ),
    );
    if (upserts.length > 0) {
      await charApi.post(`/stock-counts/${id}/items/bulk/`, {
        items: upserts,
      });
    }
    if (note !== undefined) {
      await charApi.patch(`/stock-counts/${id}/`, { note });
    }
    return await getStockCountAction(id);
  } catch (error) {
    throw toApiError(error);
  }
};

/** Confirma el borrador (`POST …/confirm/`): ajusta el stock y congela el recuento. */
export const confirmStockCountAction = async (id: number) => {
  try {
    const { data } = await charApi.post<StockCountDetail>(
      `/stock-counts/${id}/confirm/`,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

/** Cancela el borrador (`POST …/cancel/`); no toca el stock. */
export const cancelStockCountAction = async (id: number) => {
  try {
    const { data } = await charApi.post<StockCountDetail>(
      `/stock-counts/${id}/cancel/`,
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
