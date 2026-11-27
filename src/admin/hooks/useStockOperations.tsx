import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createStockOperationAction,
  getStockLevelAction,
  getStockOperationAction,
  getStockOperationsAction,
  reverseStockMovementAction,
  type GetStockOperationsParams,
} from "../actions/stock-operations.action";
import { stockKeys } from "../config/query-keys";

/** Historial paginado (una fila por operación); conserva la página anterior mientras carga la nueva. */
export const useStockOperations = (params: GetStockOperationsParams = {}) =>
  useQuery({
    queryKey: stockKeys.operations(params),
    queryFn: () => getStockOperationsAction(params),
    placeholderData: keepPreviousData,
  });

/** Una operación con sus líneas. Sin `id` válido no pide nada. */
export const useStockOperation = (id: number | null) =>
  useQuery({
    queryKey: stockKeys.operation(id),
    queryFn: () => getStockOperationAction(id as number),
    enabled: id !== null,
  });

/** Saldo de una variante (para precargar el formulario de movimiento). */
export const useStockLevel = (variantId: number | null) =>
  useQuery({
    queryKey: stockKeys.level(variantId),
    queryFn: () => getStockLevelAction(variantId as number),
    enabled: variantId !== null,
  });

/** Registra un ingreso/egreso y refresca todo el stock (grilla, resumen, historial). */
export const useCreateStockOperation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStockOperationAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stockKeys.all }),
  });
};

/** Anula una línea y refresca todo el stock (la línea pasa a "Anulada"). */
export const useReverseStockMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reverseStockMovementAction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stockKeys.all }),
  });
};
