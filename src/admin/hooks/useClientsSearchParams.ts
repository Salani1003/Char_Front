import { useSearchParams } from "react-router";
import { isClientOrigin, CLIENT_ORIGINS } from "../config/client-origins";
import type { ClientOrigin } from "../interfaces/client.interface";

/** Orden por defecto del backend (más recientes primero). */
export const DEFAULT_CLIENT_ORDERING = "-created_at";
/** Tamaño de página por defecto del backend. */
export const DEFAULT_CLIENT_PAGE_SIZE = 20;
/** Campos por los que se puede ordenar desde la tabla. */
export const CLIENT_ORDERING_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "origin",
  "created_at",
] as const;
/** Tamaños de página elegibles (el backend admite hasta 100). */
export const CLIENT_PAGE_SIZES = [10, 20, 50, 100];

/** Criterios del listado de clientes que se reflejan en la URL. */
export interface ClientsCriteria {
  search: string;
  origins: ClientOrigin[];
  /** `YYYY-MM-DD` o `""`. */
  createdFrom: string;
  /** `YYYY-MM-DD` o `""`. */
  createdTo: string;
  /** Campo de orden; prefijo `-` = descendente. */
  ordering: string;
  pageSize: number;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isOrdering = (value: string) =>
  (CLIENT_ORDERING_FIELDS as readonly string[]).includes(
    value.replace(/^-/, ""),
  );

/**
 * Estado del listado de clientes guardado en la query string de la URL, para
 * poder compartir o recargar la pantalla con los mismos filtros: `q`,
 * `origin` (repetido), `created_from`, `created_to`, `ordering`, `page` y
 * `page_size`. Todo valor inválido (origen desconocido, fecha mal escrita,
 * página no numérica, ...) se ignora y cae al valor por defecto, y los valores
 * por defecto no se escriben en la URL.
 *
 * `setCriteria` cambia uno o varios criterios y vuelve a la página 1 (así no
 * se pide una página con criterios viejos); `setPage` solo cambia la página.
 * Con `replace` no agrega una entrada al historial (para el texto de
 * búsqueda, que cambia en cada pausa de tipeo). Las actualizaciones son
 * funcionales, así que se pueden llamar desde un `setTimeout` sin leer datos
 * viejos.
 */
export function useClientsSearchParams() {
  const [params, setParams] = useSearchParams();

  const search = params.get("q") ?? "";
  const origins = CLIENT_ORIGINS.filter((origin) =>
    params.getAll("origin").filter(isClientOrigin).includes(origin),
  );
  const createdFrom = DATE.test(params.get("created_from") ?? "")
    ? (params.get("created_from") as string)
    : "";
  const createdTo = DATE.test(params.get("created_to") ?? "")
    ? (params.get("created_to") as string)
    : "";
  const rawOrdering = params.get("ordering") ?? "";
  const ordering = isOrdering(rawOrdering)
    ? rawOrdering
    : DEFAULT_CLIENT_ORDERING;
  const rawPageSize = Number(params.get("page_size"));
  const pageSize = CLIENT_PAGE_SIZES.includes(rawPageSize)
    ? rawPageSize
    : DEFAULT_CLIENT_PAGE_SIZE;
  const rawPage = Number(params.get("page"));
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  const criteria: ClientsCriteria = {
    search,
    origins,
    createdFrom,
    createdTo,
    ordering,
    pageSize,
  };

  const setCriteria = (
    changes: Partial<ClientsCriteria>,
    { replace = false }: { replace?: boolean } = {},
  ) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const set = (key: string, value: string, fallback = "") => {
          if (value && value !== fallback) next.set(key, value);
          else next.delete(key);
        };
        if (changes.search !== undefined) set("q", changes.search.trim());
        if (changes.origins !== undefined) {
          next.delete("origin");
          changes.origins.forEach((origin) => next.append("origin", origin));
        }
        if (changes.createdFrom !== undefined)
          set("created_from", changes.createdFrom);
        if (changes.createdTo !== undefined)
          set("created_to", changes.createdTo);
        if (changes.ordering !== undefined)
          set("ordering", changes.ordering, DEFAULT_CLIENT_ORDERING);
        if (changes.pageSize !== undefined)
          set(
            "page_size",
            String(changes.pageSize),
            String(DEFAULT_CLIENT_PAGE_SIZE),
          );
        next.delete("page");
        return next;
      },
      { replace },
    );
  };

  const setPage = (nextPage: number) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextPage > 1) next.set("page", String(nextPage));
        else next.delete("page");
        return next;
      },
      { replace: true },
    );
  };

  return { criteria, page, setCriteria, setPage };
}
