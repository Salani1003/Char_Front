import { charApi } from "@/lib/charApi";
import type { Paginated } from "../interfaces/paginated.interface";
import type { User } from "../interfaces/user.interface";

export interface GetUsersParams {
  /** Página a pedir (empieza en 1); por defecto 1. */
  page?: number;
  /** Cantidad de resultados por página; si se omite, usa el del backend. */
  page_size?: number;
  /** Texto de búsqueda; el backend filtra por nombre, email o usuario. */
  search?: string;
  /** `true` activos, `false` inactivos, `undefined` todos. */
  is_active?: boolean;
}

/** Lista los usuarios (`GET /users/`) con paginación, búsqueda y filtro. */
export const getUsersAction = async ({
  page = 1,
  page_size,
  search,
  is_active,
}: GetUsersParams = {}) => {
  const { data } = await charApi.get<Paginated<User>>("/users/", {
    params: { page, page_size, search: search || undefined, is_active },
  });

  return data;
};
