import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getProductVariantsAction,
  type GetProductVariantsParams,
} from "../actions/get-product-variants.action";

/**
 * Lista paginada de variantes de producto. Todos los criterios (página,
 * tamaño, búsqueda, orden y filtros) forman parte de la `queryKey`; se
 * conserva el resultado anterior mientras carga el nuevo (`isPlaceholderData`).
 */
export const useProductVariants = (params: GetProductVariantsParams = {}) => {
  return useQuery({
    queryKey: ["product-variants", params],
    queryFn: () => getProductVariantsAction(params),
    placeholderData: keepPreviousData,
  });
};
