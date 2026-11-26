import { charApi } from "@/lib/charApi";
import type { ClientOrigin } from "../interfaces/client.interface";
import type { Client } from "../interfaces/client.interface";
import type { Paginated } from "../interfaces/paginated.interface";

export interface GetClientsParams {
  /** Página a pedir (empieza en 1); por defecto 1. */
  page?: number;
  /** Resultados por página (default del backend 20, máx 100). */
  page_size?: number;
  /** Busca en nombre, apellido y email. */
  search?: string;
  /** Campo de orden; prefijo `-` = descendente. Default del backend: `-created_at`. */
  ordering?: string;
  /** Uno o varios orígenes (repetible en la query). */
  origin?: ClientOrigin[];
  /** Alta desde (inclusive), `YYYY-MM-DD`. */
  created_from?: string;
  /** Alta hasta (inclusive), `YYYY-MM-DD`. */
  created_to?: string;
}

/**
 * Lista los clientes (`GET /clients/`) con paginación, búsqueda, orden y
 * filtros. `origin` se serializa repetido (`?origin=a&origin=b`) y los
 * parámetros vacíos no se envían.
 */
export const getClientsAction = async ({
  page = 1,
  page_size,
  search,
  ordering,
  origin,
  created_from,
  created_to,
}: GetClientsParams = {}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (page_size) params.set("page_size", String(page_size));
  if (search) params.set("search", search);
  if (ordering) params.set("ordering", ordering);
  origin?.forEach((value) => params.append("origin", value));
  if (created_from) params.set("created_from", created_from);
  if (created_to) params.set("created_to", created_to);

  const { data } = await charApi.get<Paginated<Client>>("/clients/", {
    params,
  });
  return data;
};
