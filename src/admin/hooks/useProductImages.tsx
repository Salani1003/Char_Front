import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  deleteProductImageAction,
  updateProductImageAction,
} from "../actions/product-images.action";
import { productKeys, productVariantKeys } from "../config/query-keys";
import type { ProductImageItem } from "../interfaces/product-image.interface";
import type { UpdateProductImageRequest } from "../interfaces/product-image.request";
import type { ProductWithVariants } from "../interfaces/product.interface";
import {
  applyPrimary,
  applySortOrders,
  type SortOrderPatch,
} from "../utils/productImages";

/**
 * Las fotos viven dentro de `GET /products/:id/with-variants/` (`images`): ese
 * es el único lugar que se actualiza. También se refresca la grilla de
 * variantes (`product-variants`), que trae la foto de cada color
 * (`image_url`/`thumbnail_url`).
 */
export const refreshProductImages = (
  queryClient: QueryClient,
  productId: number,
) =>
  Promise.all([
    queryClient.invalidateQueries({
      queryKey: productKeys.withVariants(productId),
    }),
    queryClient.invalidateQueries({ queryKey: productVariantKeys.all }),
  ]);

/** Reescribe `images` en la caché de `with-variants` (para las actualizaciones optimistas). */
const rewriteImages = (
  queryClient: QueryClient,
  productId: number,
  rewrite: (images: ProductImageItem[]) => ProductImageItem[],
) =>
  queryClient.setQueryData<ProductWithVariants>(
    productKeys.withVariants(productId),
    (old) => (old ? { ...old, images: rewrite(old.images ?? []) } : old),
  );

/**
 * Marca una foto como la principal de su color (`PATCH {is_primary: true}`;
 * el backend desmarca a la anterior). **Optimista**: la caché cambia al
 * instante y se revierte si falla. Al terminar se vuelve a pedir lo real.
 * Se llama con el `id` de la foto.
 */
export const useSetPrimaryImage = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) =>
      updateProductImageAction(imageId, { is_primary: true }),
    onMutate: async (imageId) => {
      await queryClient.cancelQueries({
        queryKey: productKeys.withVariants(productId),
      });
      const previous = queryClient.getQueryData<ProductWithVariants>(
        productKeys.withVariants(productId),
      );
      rewriteImages(queryClient, productId, (images) =>
        applyPrimary(images, imageId),
      );
      return { previous };
    },
    onError: (_error, _imageId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          productKeys.withVariants(productId),
          context.previous,
        );
      }
    },
    onSettled: () => refreshProductImages(queryClient, productId),
  });
};

/**
 * Persiste un reordenamiento: un `PATCH {sort_order}` por cada foto cuyo valor
 * cambió (no hay endpoint masivo), en paralelo. **Optimista**; si alguno falla
 * se vuelve a cargar el estado real (y la mutación lanza el primer error para
 * que la pantalla avise). Se llama con `plan.patches` de `reorderImages`.
 */
export const useReorderImages = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patches: SortOrderPatch[]) => {
      const results = await Promise.allSettled(
        patches.map((p) =>
          updateProductImageAction(p.id, { sort_order: p.sort_order }),
        ),
      );
      const failed = results.find((r) => r.status === "rejected");
      if (failed) throw failed.reason;
    },
    onMutate: async (patches) => {
      await queryClient.cancelQueries({
        queryKey: productKeys.withVariants(productId),
      });
      rewriteImages(queryClient, productId, (images) =>
        applySortOrders(images, patches),
      );
    },
    onSettled: () => refreshProductImages(queryClient, productId),
  });
};

/**
 * Guarda la edición de una foto desde el panel de detalle: un `PATCH` con lo
 * que cambió (`patch`) y, si se movió de posición, los `PATCH` de `sort_order`
 * de las demás fotos afectadas (`reorder`). Refresca al terminar; lanza el
 * primer error (un `ApiError`).
 */
export const useSaveProductImage = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
      reorder,
    }: {
      id: number;
      patch: UpdateProductImageRequest;
      reorder: SortOrderPatch[];
    }) => {
      const requests = [
        ...(Object.keys(patch).length > 0
          ? [updateProductImageAction(id, patch)]
          : []),
        ...reorder.map((p) =>
          updateProductImageAction(p.id, { sort_order: p.sort_order }),
        ),
      ];
      const results = await Promise.allSettled(requests);
      const failed = results.find((r) => r.status === "rejected");
      if (failed) throw failed.reason;
    },
    onSettled: () => refreshProductImages(queryClient, productId),
  });
};

/**
 * Elimina una foto (`DELETE`): también borra el archivo del servidor de
 * imágenes y no se puede deshacer. Si el servidor de imágenes falla (502) la
 * foto **no** se elimina y la mutación lanza un `ApiError` (su `cause` trae el
 * estado). Si borrás la principal el backend no promueve otra.
 */
export const useDeleteProductImage = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) => deleteProductImageAction(imageId),
    onSuccess: () => refreshProductImages(queryClient, productId),
  });
};
