import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  cancelStockCountAction,
  confirmStockCountAction,
  createStockCountAction,
  getAllStockLevelsAction,
  getStockCountAction,
  getStockCountsAction,
  saveStockCountDraftAction,
  type GetStockCountsParams,
} from "../actions/stock-counts.action";
import { stockKeys } from "../config/query-keys";

/** Lista paginada de recuentos; conserva la página anterior mientras carga la nueva. */
export const useStockCounts = (params: GetStockCountsParams = {}) =>
  useQuery({
    queryKey: stockKeys.counts(params),
    queryFn: () => getStockCountsAction(params),
    placeholderData: keepPreviousData,
  });

/** Un recuento con sus líneas. Sin `id` válido no pide nada. */
export const useStockCount = (id: number | null) =>
  useQuery({
    queryKey: stockKeys.count(id),
    queryFn: () => getStockCountAction(id as number),
    enabled: id !== null,
  });

/**
 * Todos los saldos actuales (para "En sistema hoy" y "Cargar todas las
 * variantes" de un borrador). Siempre se piden frescos al montar: otro
 * usuario pudo mover stock.
 */
export const useAllStockLevels = (enabled = true) =>
  useQuery({
    queryKey: stockKeys.allLevels(),
    queryFn: getAllStockLevelsAction,
    enabled,
    staleTime: 0,
  });

/** Crea un recuento vacío en borrador. */
export const useCreateStockCount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStockCountAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stockKeys.all }),
  });
};

/** Guarda el borrador (líneas y nota) y refresca el recuento. */
export const useSaveStockCountDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStockCountDraftAction,
    onSettled: () => queryClient.invalidateQueries({ queryKey: stockKeys.all }),
  });
};

/** Confirma un recuento: ajusta el stock, así que refresca todo el stock (grilla, resumen, historial). */
export const useConfirmStockCount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmStockCountAction,
    onSettled: () => queryClient.invalidateQueries({ queryKey: stockKeys.all }),
  });
};

/** Cancela un borrador (no toca el stock). */
export const useCancelStockCount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelStockCountAction,
    onSettled: () => queryClient.invalidateQueries({ queryKey: stockKeys.all }),
  });
};
