import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getUsersAction,
  type GetUsersParams,
} from "../actions/get-users.actions";

/**
 * Lista paginada de usuarios. La página, el tamaño, la búsqueda y el filtro de
 * estado forman parte de la `queryKey`, así cada combinación se cachea por
 * separado, y se conserva el resultado anterior mientras carga el nuevo para
 * que el listado no parpadee (`isPlaceholderData` indica que se está
 * mostrando el anterior).
 */
export const useUsers = ({
  page = 1,
  page_size,
  search = "",
  is_active,
}: GetUsersParams = {}) => {
  return useQuery({
    queryKey: ["users", { page, page_size, search, is_active }],
    queryFn: () => getUsersAction({ page, page_size, search, is_active }),
    placeholderData: keepPreviousData,
  });
};
