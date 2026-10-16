import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getUsersAction,
  type GetUsersParams,
} from "../actions/get-users.actions";

/**
 * Lista de usuarios. La búsqueda y el filtro de estado forman parte de la `queryKey`, así cada texto
 * se cachea por separado, y se conserva el resultado anterior mientras carga
 * el nuevo para que la tabla no parpadee.
 */
export const useUsers = ({ search = "", is_active }: GetUsersParams = {}) => {
  return useQuery({
    queryKey: ["users", { search, is_active }],
    queryFn: () => getUsersAction({ search, is_active }),
    placeholderData: keepPreviousData,
  });
};
