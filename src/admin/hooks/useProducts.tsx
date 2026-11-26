import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  getProductsAction,
  type GetProductsParams,
} from "../actions/get-products.action";
import {
  createProductAction,
  deleteProductAction,
  getProductAction,
  getProductWithVariantsAction,
  updateProductAction,
} from "../actions/products.action";
import {
  categoryKeys,
  productKeys,
  productVariantKeys,
} from "../config/query-keys";
import type { UpdateProductRequest } from "../interfaces/product.request";

/**
 * Un cambio de producto refresca el producto (detalle y con variantes), la
 * grilla de variantes del Catálogo (que muestra su nombre, precio y
 * publicación) y las categorías (`products_count`).
 */
const invalidateProduct = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: productKeys.all }),
    queryClient.invalidateQueries({ queryKey: productVariantKeys.all }),
    queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  ]);

/**
 * Lista paginada de productos (con `variants_count` y, con permiso, sus
 * `variants`). Todos los criterios forman parte de la `queryKey` y se conserva
 * el resultado anterior mientras carga el nuevo (`isPlaceholderData`).
 */
export const useProductList = (params: GetProductsParams = {}) =>
  useQuery({
    queryKey: productKeys.list({
      ...params,
      filters: undefined,
      ...params.filters,
    }),
    queryFn: () => getProductsAction(params),
    placeholderData: keepPreviousData,
  });

/** Detalle de un producto. `id: null` no hace ningún request. `cost_price` solo viene con `products.view_cost_price`. */
export const useProduct = (id: number | null) =>
  useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductAction(id as number),
    enabled: id !== null,
  });

/**
 * Producto con sus variantes activas (ordenadas por color y talle). Exige
 * además `products.view_productvariant`: `enabled: false` (o `id: null`) no hace ningún request.
 */
export const useProductWithVariants = (
  id: number | null,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: productKeys.withVariants(id),
    queryFn: () => getProductWithVariantsAction(id as number),
    enabled: id !== null && enabled,
  });

/** Crea un producto e invalida lo relacionado. Devuelve el producto tal como lo devolvió la API. */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductAction,
    onSuccess: () => invalidateProduct(queryClient),
  });
};

/** Edita un producto (`PATCH` con solo los campos pasados) e invalida lo relacionado. Devuelve el producto de la API. */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateProductRequest;
    }) => updateProductAction(id, payload),
    onSuccess: () => invalidateProduct(queryClient),
  });
};

/**
 * Elimina un producto (borrado lógico) e invalida lo relacionado. Las queries
 * de productos se marcan viejas **sin refetch inmediato**: la pantalla de
 * edición sigue montada hasta navegar y volver a pedir un producto eliminado
 * daría 404 (parpadeo de "Producto no encontrado").
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProductAction,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: productKeys.all,
          refetchType: "none",
        }),
        queryClient.invalidateQueries({ queryKey: productVariantKeys.all }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
      ]),
  });
};
