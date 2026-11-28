import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  createSaleAction,
  getSaleAction,
  getSalesAction,
  voidSaleAction,
  type GetSalesParams,
} from "../actions/sales.action";
import {
  exchangeKeys,
  productVariantKeys,
  saleKeys,
  stockKeys,
} from "../config/query-keys";
import type { VoidRequest } from "../interfaces/sale.request";

/** Una venta o un cambio mueve stock: refresca ventas, cambios, saldos y la grilla de variantes. */
export const refreshAfterSaleChange = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: saleKeys.all }),
    queryClient.invalidateQueries({ queryKey: exchangeKeys.all }),
    queryClient.invalidateQueries({ queryKey: stockKeys.all }),
    queryClient.invalidateQueries({ queryKey: productVariantKeys.all }),
  ]);

/** Listado paginado de ventas; conserva la página anterior mientras carga la nueva. */
export const useSales = (params: GetSalesParams = {}) =>
  useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => getSalesAction(params),
    placeholderData: keepPreviousData,
  });

/** Una venta con ítems y cambios. Sin `id` válido no pide nada. */
export const useSale = (id: number | null) =>
  useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => getSaleAction(id as number),
    enabled: id !== null,
  });

/** Registra una venta. El front nunca envía precios. Refresca ventas, stock y variantes. */
export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSaleAction,
    onSuccess: () => refreshAfterSaleChange(queryClient),
  });
};

/** Anula una venta (devuelve el stock). Recibe `{ id, reason }`. */
export const useVoidSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & VoidRequest) =>
      voidSaleAction(id, payload),
    onSuccess: () => refreshAfterSaleChange(queryClient),
  });
};
