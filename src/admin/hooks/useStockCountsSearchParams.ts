import { useSearchParams } from "react-router";
import { STOCK_COUNT_STATUS_OPTIONS } from "../config/stock-counts";

/** Tamaño de página por defecto del backend. */
export const DEFAULT_COUNTS_PAGE_SIZE = 20;
/** Tamaños de página elegibles (el backend admite hasta 100). */
export const COUNTS_PAGE_SIZES = [10, 20, 50, 100];
/** Campos por los que admite ordenar el backend (por defecto: más nuevos primero). */
export const COUNTS_ORDERING_FIELDS = ["created_at", "confirmed_at"] as const;

/** Criterios de la lista de recuentos que se reflejan en la URL. */
export interface CountsCriteria {
  search: string;
  /** `borrador`, `confirmado`, `cancelado` o `""`. */
  status: string;
  /** `YYYY-MM-DD` (fecha de creación) o `""`. */
  dateFrom: string;
  dateTo: string;
  /** `""` = el del backend (más nuevos primero). */
  ordering: string;
  pageSize: number;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isOrdering = (value: string) =>
  (COUNTS_ORDERING_FIELDS as readonly string[]).includes(
    value.replace(/^-/, ""),
  );

/**
 * Estado de la lista de recuentos guardado en la query string: `q`, `status`,
 * `date_from`, `date_to`, `ordering`, `page` y `page_size`. Todo valor
 * inválido se ignora y los valores por defecto no se escriben.
 * `setCriteria` vuelve a la página 1; `setPage` solo cambia la página.
 */
export function useStockCountsSearchParams() {
  const [params, setParams] = useSearchParams();

  const rawStatus = params.get("status") ?? "";
  const rawFrom = params.get("date_from") ?? "";
  const rawTo = params.get("date_to") ?? "";
  const rawOrdering = params.get("ordering") ?? "";
  const rawPageSize = Number(params.get("page_size"));
  const rawPage = Number(params.get("page"));

  const criteria: CountsCriteria = {
    search: params.get("q") ?? "",
    status: STOCK_COUNT_STATUS_OPTIONS.some((o) => o.value === rawStatus)
      ? rawStatus
      : "",
    dateFrom: DATE.test(rawFrom) ? rawFrom : "",
    dateTo: DATE.test(rawTo) ? rawTo : "",
    ordering: isOrdering(rawOrdering) ? rawOrdering : "",
    pageSize: COUNTS_PAGE_SIZES.includes(rawPageSize)
      ? rawPageSize
      : DEFAULT_COUNTS_PAGE_SIZE,
  };
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  const setCriteria = (
    changes: Partial<CountsCriteria>,
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
        if (changes.status !== undefined) set("status", changes.status);
        if (changes.dateFrom !== undefined) set("date_from", changes.dateFrom);
        if (changes.dateTo !== undefined) set("date_to", changes.dateTo);
        if (changes.ordering !== undefined) set("ordering", changes.ordering);
        if (changes.pageSize !== undefined)
          set(
            "page_size",
            String(changes.pageSize),
            String(DEFAULT_COUNTS_PAGE_SIZE),
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
