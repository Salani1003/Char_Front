import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getStockAction,
  getStockSummaryAction,
  updateMinStockAction,
  type GetStockParams,
} from "../actions/stock.action";
import { productVariantKeys, stockKeys } from "../config/query-keys";

/**
 * Grilla de saldos paginada. Todos los criterios forman parte de la
 * `queryKey` y se conserva el resultado anterior mientras carga el nuevo.
 */
export const useStock = (params: GetStockParams = {}) =>
  useQuery({
    queryKey: stockKeys.list(params),
    queryFn: () => getStockAction(params),
    placeholderData: keepPreviousData,
  });

/** Totales de las tarjetas de resumen (todas las variantes, sin filtros). */
export const useStockSummary = () =>
  useQuery({
    queryKey: stockKeys.summary(),
    queryFn: getStockSummaryAction,
  });

/**
 * Cambia el stock mínimo de una variante. Al guardar, refresca la grilla y el
 * resumen (la fila puede pasar a "Stock bajo") y la grilla de variantes.
 */
export const useUpdateMinStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, minStock }: { id: number; minStock: number }) =>
      updateMinStockAction(id, minStock),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: stockKeys.all }),
        queryClient.invalidateQueries({ queryKey: productVariantKeys.all }),
      ]),
  });
};
