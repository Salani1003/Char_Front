import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createColorAction,
  getAllColorsAction,
  getColorAction,
  getColorsAction,
  type GetColorsParams,
} from "../actions/colors.action";
import { catalogLookupKeys, colorKeys } from "../config/query-keys";

/** Lista paginada de colores; con y sin `search`. `enabled: false` pausa la request. */
export const useColors = (
  params: GetColorsParams = {},
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: colorKeys.list({ ...params }),
    queryFn: () => getColorsAction(params),
    placeholderData: keepPreviousData,
    enabled,
  });

/** Todos los colores (recorre las páginas), en el orden de la API. Es la forma habitual de usarlos. */
export const useAllColors = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: colorKeys.allPages(),
    queryFn: () => getAllColorsAction(),
    enabled,
  });

/** Detalle de un color. `id: null` no hace ningún request. */
export const useColor = (id: number | null) =>
  useQuery({
    queryKey: colorKeys.detail(id),
    queryFn: () => getColorAction(id as number),
    enabled: id !== null,
  });

/**
 * Crea un color e invalida `colors`. Devuelve el color tal como lo devolvió la
 * API (ej. `hex` normalizado a mayúsculas); un nombre repetido llega como
 * `ApiError.existing`.
 */
export const useCreateColor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createColorAction,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: colorKeys.all }),
        queryClient.invalidateQueries({ queryKey: catalogLookupKeys.all }),
      ]),
  });
};
