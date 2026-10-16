import { charApi } from "@/lib/charApi";
import type { UsersResponse } from "../interfaces/users.response";

export interface GetUsersParams {
  /** Texto de búsqueda; el backend filtra por nombre, email o usuario. */
  search?: string;
  /** `true` activos, `false` inactivos, `undefined` todos. */
  is_active?: boolean;
}

export const getUsersAction = async ({
  search,
  is_active,
}: GetUsersParams = {}) => {
  const { data } = await charApi.get<UsersResponse>("/users/", {
    params: { search: search || undefined, is_active },
  });

  return data;
};
