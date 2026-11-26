import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createSizeAction,
  getAllSizesAction,
  getSizeAction,
  getSizesAction,
  type GetSizesParams,
} from "../actions/sizes.action";
import { catalogLookupKeys, sizeKeys } from "../config/query-keys";

/** Lista paginada de talles; con y sin `search`. `enabled: false` pausa la request. */
export const useSizes = (
  params: GetSizesParams = {},
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: sizeKeys.list({ ...params }),
    queryFn: () => getSizesAction(params),
    placeholderData: keepPreviousData,
    enabled,
  });

/** Todos los talles (recorre las páginas), en el orden de la API (`order`). Es la forma habitual de usarlos. */
export const useAllSizes = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: sizeKeys.allPages(),
    queryFn: () => getAllSizesAction(),
    enabled,
  });

/** Detalle de un talle. `id: null` no hace ningún request. */
export const useSize = (id: number | null) =>
  useQuery({
    queryKey: sizeKeys.detail(id),
    queryFn: () => getSizeAction(id as number),
    enabled: id !== null,
  });

/**
 * Crea un talle e invalida `sizes`. Devuelve el talle tal como lo devolvió la
 * API (nombre en MAYÚSCULAS); un nombre repetido llega como `ApiError.existing`.
 */
export const useCreateSize = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSizeAction,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: sizeKeys.all }),
        queryClient.invalidateQueries({ queryKey: catalogLookupKeys.all }),
      ]),
  });
};
