import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createProductModelAction,
  getAllProductModelsAction,
  getProductModelAction,
  getProductModelsAction,
  type GetProductModelsParams,
} from "../actions/product-models.action";
import { catalogLookupKeys, productModelKeys } from "../config/query-keys";

/**
 * Lista paginada de modelos; con y sin `search` y filtrable por `brand`
 * (autocompletado dependiente de la marca). Conserva el resultado anterior
 * mientras carga el nuevo. `enabled: false` pausa la request (ej. sin marca).
 */
export const useProductModels = (
  params: GetProductModelsParams = {},
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: productModelKeys.list({ ...params }),
    queryFn: () => getProductModelsAction(params),
    placeholderData: keepPreviousData,
    enabled,
  });

/** Todos los modelos (de una marca si se pasa `brand`), en el orden de la API. */
export const useAllProductModels = (
  params: Omit<GetProductModelsParams, "page" | "page_size"> = {},
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: productModelKeys.allPages({ ...params }),
    queryFn: () => getAllProductModelsAction(params),
    enabled,
  });

/** Detalle de un modelo. `id: null` no hace ningún request. */
export const useProductModel = (id: number | null) =>
  useQuery({
    queryKey: productModelKeys.detail(id),
    queryFn: () => getProductModelAction(id as number),
    enabled: id !== null,
  });

/**
 * Crea un modelo e invalida `product-models`. Devuelve el modelo tal como lo
 * devolvió la API; un nombre repetido en la marca llega como `ApiError.existing`.
 */
export const useCreateProductModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductModelAction,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: productModelKeys.all }),
        queryClient.invalidateQueries({ queryKey: catalogLookupKeys.all }),
      ]),
  });
};
