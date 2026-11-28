import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createExchangeAction,
  getExchangeAction,
  getExchangesAction,
  previewExchangeAction,
  voidExchangeAction,
  type GetExchangesParams,
} from "../actions/exchanges.action";
import { exchangeKeys } from "../config/query-keys";
import type {
  ExchangePreviewRequest,
  VoidRequest,
} from "../interfaces/sale.request";
import { useDebounce } from "@/hooks/useDebounce";
import { refreshAfterSaleChange } from "./useSales";

/** Listado paginado de cambios; conserva la página anterior mientras carga la nueva. */
export const useExchanges = (params: GetExchangesParams = {}) =>
  useQuery({
    queryKey: exchangeKeys.list(params),
    queryFn: () => getExchangesAction(params),
    placeholderData: keepPreviousData,
  });

/** Un cambio con sus líneas. Sin `id` válido no pide nada. */
export const useExchange = (id: number | null) =>
  useQuery({
    queryKey: exchangeKeys.detail(id),
    queryFn: () => getExchangeAction(id as number),
    enabled: id !== null,
  });

/**
 * Vista previa de un cambio (sin guardar): el balance de la pantalla sale de
 * acá, nunca se calcula en el front. Espera 300 ms tras el último cambio de la
 * selección, conserva el resultado anterior mientras calcula (`isFetching`
 * indica el indicador de carga), cancela el pedido que quedó viejo y no
 * reintenta (un 400 es una respuesta válida: plazo, cantidades, sin stock).
 * `isCalculating` es `true` mientras la selección actual todavía no tiene
 * resultado; con `body` en `null` no pide nada (ignorar su `data`).
 *
 * @param body Selección actual, o `null` si todavía no hay nada devuelto.
 */
export const useExchangePreview = (body: ExchangePreviewRequest | null) => {
  const json = body ? JSON.stringify(body) : null;
  const debouncedJson = useDebounce(json, 300);
  const debounced = debouncedJson
    ? (JSON.parse(debouncedJson) as ExchangePreviewRequest)
    : null;
  const query = useQuery({
    queryKey: exchangeKeys.preview(debounced ?? {}),
    queryFn: ({ signal }) =>
      previewExchangeAction(debounced as ExchangePreviewRequest, signal),
    enabled: debounced !== null && body !== null,
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
  return {
    ...query,
    /** `true` mientras la selección cambió y todavía no hay un resultado para ella (espera del debounce o pedido en curso). */
    isCalculating:
      body !== null &&
      (json !== debouncedJson || query.isFetching || query.isPlaceholderData),
  };
};

/** Registra un cambio. Refresca ventas, cambios, stock y variantes. */
export const useCreateExchange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExchangeAction,
    onSuccess: () => refreshAfterSaleChange(queryClient),
  });
};

/** Anula un cambio. Recibe `{ id, reason }`. */
export const useVoidExchange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & VoidRequest) =>
      voidExchangeAction(id, payload),
    onSuccess: () => refreshAfterSaleChange(queryClient),
  });
};
