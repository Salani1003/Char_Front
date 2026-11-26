import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProductVariantAction,
  deleteProductVariantAction,
} from "../actions/product-variants.action";
import { productKeys, productVariantKeys } from "../config/query-keys";

/**
 * Crea una variante e invalida el producto con variantes (`with-variants`) y
 * la grilla del Catálogo. Devuelve la variante tal como la devolvió la API
 * (con su SKU).
 */
export const useCreateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductVariantAction,
    onSuccess: (variant) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: productKeys.withVariants(variant.product),
        }),
        queryClient.invalidateQueries({ queryKey: productVariantKeys.all }),
      ]),
  });
};

/**
 * Elimina una variante (borrado lógico). Hay que pasar también el `productId`
 * para invalidar el `with-variants` de su producto, además de la grilla del
 * Catálogo. Si era la última de un producto publicado el `ApiError` trae el
 * mensaje del backend.
 */
export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; productId: number }) =>
      deleteProductVariantAction(id),
    onSuccess: (_, { productId }) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: productKeys.withVariants(productId),
        }),
        queryClient.invalidateQueries({ queryKey: productVariantKeys.all }),
      ]),
  });
};
