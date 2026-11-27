import { useSearchParams } from "react-router";
import {
  STOCK_ID_FILTER_KEYS,
  type StockIdFilterKey,
  type StockStatus,
} from "../actions/stock.action";

/** Tamaño de página por defecto del backend. */
export const DEFAULT_STOCK_PAGE_SIZE = 20;
/** Tamaños de página elegibles (el backend admite hasta 100). */
export const STOCK_PAGE_SIZES = [10, 20, 50, 100];
/** Campos por los que admite ordenar el backend. */
export const STOCK_ORDERING_FIELDS = [
  "quantity",
  "min_stock",
  "sku",
  "product__name",
  "color__name",
  "size__order",
] as const;
const STATUSES: StockStatus[] = ["all", "in", "out", "low"];

/** Criterios de la grilla de stock que se reflejan en la URL. */
export interface StockCriteria {
  search: string;
  status: StockStatus;
  /** Filtros por id; los inactivos son `""`. */
  filters: Record<StockIdFilterKey, string>;
  /** Campo de orden (prefijo `-` = descendente); `""` = orden del backend. */
  ordering: string;
  pageSize: number;
}

const ID = /^\d+$/;
const isOrdering = (value: string) =>
  (STOCK_ORDERING_FIELDS as readonly string[]).includes(
    value.replace(/^-/, ""),
  );

/**
 * Estado de la grilla de stock guardado en la query string de la URL (para
 * compartir o recargar): `q`, `status` (`in`/`out`/`low`; `all` no se
 * escribe), un parámetro por filtro (`category`, `brand`, `color`, `size`,
 * con el nombre de la API), `ordering`, `page` y `page_size`. Todo valor
 * inválido se ignora y los valores por defecto no se escriben.
 *
 * `setCriteria` cambia uno o varios criterios (`filters` se fusiona con los
 * actuales) y vuelve a la página 1; `setPage` solo cambia la página. Con
 * `replace` no agrega una entrada al historial.
 */
export function useStockSearchParams() {
  const [params, setParams] = useSearchParams();

  const filters = {} as Record<StockIdFilterKey, string>;
  for (const key of STOCK_ID_FILTER_KEYS) {
    const value = params.get(key) ?? "";
    filters[key] = ID.test(value) ? value : "";
  }
  const rawStatus = params.get("status") as StockStatus;
  const rawOrdering = params.get("ordering") ?? "";
  const rawPageSize = Number(params.get("page_size"));
  const rawPage = Number(params.get("page"));

  const criteria: StockCriteria = {
    search: params.get("q") ?? "",
    status: STATUSES.includes(rawStatus) ? rawStatus : "all",
    filters,
    ordering: isOrdering(rawOrdering) ? rawOrdering : "",
    pageSize: STOCK_PAGE_SIZES.includes(rawPageSize)
      ? rawPageSize
      : DEFAULT_STOCK_PAGE_SIZE,
  };
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  const setCriteria = (
    changes: Partial<Omit<StockCriteria, "filters">> & {
      filters?: Partial<Record<StockIdFilterKey, string>>;
    },
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
        if (changes.status !== undefined) set("status", changes.status, "all");
        if (changes.ordering !== undefined) set("ordering", changes.ordering);
        if (changes.pageSize !== undefined)
          set(
            "page_size",
            String(changes.pageSize),
            String(DEFAULT_STOCK_PAGE_SIZE),
          );
        for (const [key, value] of Object.entries(changes.filters ?? {}))
          set(key, value);
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
