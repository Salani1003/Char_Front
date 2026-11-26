import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getClientsAction,
  type GetClientsParams,
} from "../actions/get-clients.action";

/**
 * Lista paginada de clientes. Todos los criterios (página, tamaño, búsqueda,
 * orden, orígenes y rango de fechas) forman parte de la `queryKey`, así cada
 * combinación se cachea por separado, y se conserva el resultado anterior
 * mientras carga el nuevo (`isPlaceholderData` indica que se muestra el
 * anterior).
 */
export const useClients = (params: GetClientsParams = {}) => {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => getClientsAction(params),
    placeholderData: keepPreviousData,
  });
};
