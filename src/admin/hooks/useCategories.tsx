import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCategoryAction,
  getAllCategoriesAction,
  getCategoriesAction,
  getCategoryAction,
  type GetCategoriesParams,
} from "../actions/categories.action";
import { catalogLookupKeys, categoryKeys } from "../config/query-keys";

/**
 * Lista paginada de categorías. Sirve con y sin búsqueda: para el
 * autocompletado de un producto usar `{ leaf: true, search }` (solo las
 * asignables). Los parámetros forman parte de la clave y se conserva el
 * resultado anterior mientras carga el nuevo. `enabled: false` pausa la
 * request (ej. con el desplegable cerrado).
 */
export const useCategories = (
  params: GetCategoriesParams = {},
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: categoryKeys.list({ ...params }),
    queryFn: () => getCategoriesAction(params),
    placeholderData: keepPreviousData,
    enabled,
  });

/** Todas las categorías que cumplen el filtro (ej. `{ root: true }`: las principales), en el orden de la API. */
export const useAllCategories = (
  params: Omit<GetCategoriesParams, "page" | "page_size"> = {},
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: categoryKeys.allPages({ ...params }),
    queryFn: () => getAllCategoriesAction(params),
    enabled,
  });

/** Detalle de una categoría. `id: null` no hace ningún request. */
export const useCategory = (id: number | null) =>
  useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategoryAction(id as number),
    enabled: id !== null,
  });

/**
 * Crea una categoría e invalida todo lo de `categories` (la principal pasa a
 * tener subcategorías). Devuelve la categoría tal como la devolvió la API; un
 * nombre repetido llega como `ApiError.existing`.
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategoryAction,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: catalogLookupKeys.all }),
      ]),
  });
};
