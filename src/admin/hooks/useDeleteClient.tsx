import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { deleteClientAction } from "../actions/delete-client.action";
import type { Client } from "../interfaces/client.interface";
import type { Paginated } from "../interfaces/paginated.interface";

/**
 * Elimina un cliente (soft delete). Al terminar quita la fila de los listados
 * cacheados y baja su `count` en el momento, y después invalida `["clients"]`
 * para traer los datos reales del backend (conteo y páginas).
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClientAction,
    onSuccess: (_, id) => {
      queryClient.setQueriesData<Paginated<Client>>(
        { queryKey: ["clients"] as QueryKey },
        (page) =>
          page && Array.isArray(page.results)
            ? {
                ...page,
                results: page.results.filter((client) => client.id !== id),
                count: Math.max(0, page.count - 1),
              }
            : page,
      );
      return queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
