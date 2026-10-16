import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getUsersAction,
  type GetUsersParams,
} from "../actions/get-users.actions";

/**
 * Lista de usuarios. La búsqueda forma parte de la `queryKey`, así cada texto
 * se cachea por separado, y se conserva el resultado anterior mientras carga
 * el nuevo para que la tabla no parpadee.
 */
export const useUsers = ({ search = "" }: GetUsersParams = {}) => {
  return useQuery({
    queryKey: ["users", { search }],
    queryFn: () => getUsersAction({ search }),
    placeholderData: keepPreviousData,
  });
};
