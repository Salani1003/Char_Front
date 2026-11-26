import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createBrandAction,
  getAllBrandsAction,
  getBrandAction,
  getBrandsAction,
  type GetBrandsParams,
} from "../actions/brands.action";
import { brandKeys, catalogLookupKeys } from "../config/query-keys";

/**
 * Lista paginada de marcas; con y sin `search` (autocompletado). Conserva el
 * resultado anterior mientras carga el nuevo. `enabled: false` pausa la request.
 */
export const useBrands = (
  params: GetBrandsParams = {},
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: brandKeys.list({ ...params }),
    queryFn: () => getBrandsAction(params),
    placeholderData: keepPreviousData,
    enabled,
  });

/** Todas las marcas (recorre las páginas), en el orden de la API. */
export const useAllBrands = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: brandKeys.allPages(),
    queryFn: () => getAllBrandsAction(),
    enabled,
  });

/** Detalle de una marca. `id: null` no hace ningún request. */
export const useBrand = (id: number | null) =>
  useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: () => getBrandAction(id as number),
    enabled: id !== null,
  });

/**
 * Crea una marca e invalida `brands`. Devuelve la marca tal como la devolvió
 * la API; un nombre repetido llega como `ApiError.existing`.
 */
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBrandAction,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: brandKeys.all }),
        queryClient.invalidateQueries({ queryKey: catalogLookupKeys.all }),
      ]),
  });
};
