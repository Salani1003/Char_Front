import { charApi } from "@/lib/charApi";
import type { UsersResponse } from "../interfaces/users.response";

export interface GetUsersParams {
  /** Texto de búsqueda; el backend filtra por nombre, email o usuario. */
  search?: string;
}

export const getUsersAction = async ({ search }: GetUsersParams = {}) => {
  const { data } = await charApi.get<UsersResponse>("/users/", {
    params: { search: search || undefined },
  });

  return data;
};
