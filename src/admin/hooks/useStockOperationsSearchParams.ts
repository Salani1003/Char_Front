import { useSearchParams } from "react-router";
import { STOCK_KIND_OPTIONS } from "../config/stock-operations";

/** Tamaño de página por defecto del backend. */
export const DEFAULT_OPERATIONS_PAGE_SIZE = 20;
/** Tamaños de página elegibles (el backend admite hasta 100). */
export const OPERATIONS_PAGE_SIZES = [10, 20, 50, 100];
/** Campos por los que admite ordenar el backend (por defecto: más nuevas primero). */
export const OPERATIONS_ORDERING_FIELDS = [
  "created_at",
  "units",
  "lines_count",
] as const;

/** Criterios del historial que se reflejan en la URL. */
export interface OperationsCriteria {
  search: string;
  /** `ingreso`, `egreso`, `ajuste` o `""`. */
  kind: string;
  reason: string;
  /** `YYYY-MM-DD` o `""`. */
  dateFrom: string;
  dateTo: string;
  /** `""` = el del backend (más nuevas primero). */
  ordering: string;
  pageSize: number;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const REASON = /^[a-z_]+$/;
const isOrdering = (value: string) =>
  (OPERATIONS_ORDERING_FIELDS as readonly string[]).includes(
    value.replace(/^-/, ""),
  );

/**
 * Estado del historial guardado en la query string: `q`, `kind`, `reason`,
 * `date_from`, `date_to`, `ordering`, `page` y `page_size`. Todo valor inválido
 * se ignora y los valores por defecto no se escriben. `setCriteria` vuelve a
 * la página 1; `setPage` solo cambia la página. Con `replace` no agrega una
 * entrada al historial del navegador.
 */
export function useStockOperationsSearchParams() {
  const [params, setParams] = useSearchParams();

  const rawKind = params.get("kind") ?? "";
  const rawReason = params.get("reason") ?? "";
  const rawFrom = params.get("date_from") ?? "";
  const rawTo = params.get("date_to") ?? "";
  const rawOrdering = params.get("ordering") ?? "";
  const rawPageSize = Number(params.get("page_size"));
  const rawPage = Number(params.get("page"));

  const criteria: OperationsCriteria = {
    search: params.get("q") ?? "",
    kind: STOCK_KIND_OPTIONS.some((o) => o.value === rawKind) ? rawKind : "",
    reason: REASON.test(rawReason) ? rawReason : "",
    dateFrom: DATE.test(rawFrom) ? rawFrom : "",
    dateTo: DATE.test(rawTo) ? rawTo : "",
    ordering: isOrdering(rawOrdering) ? rawOrdering : "",
    pageSize: OPERATIONS_PAGE_SIZES.includes(rawPageSize)
      ? rawPageSize
      : DEFAULT_OPERATIONS_PAGE_SIZE,
  };
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  const setCriteria = (
    changes: Partial<OperationsCriteria>,
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
        if (changes.kind !== undefined) set("kind", changes.kind);
        if (changes.reason !== undefined) set("reason", changes.reason);
        if (changes.dateFrom !== undefined) set("date_from", changes.dateFrom);
        if (changes.dateTo !== undefined) set("date_to", changes.dateTo);
        if (changes.ordering !== undefined) set("ordering", changes.ordering);
        if (changes.pageSize !== undefined)
          set(
            "page_size",
            String(changes.pageSize),
            String(DEFAULT_OPERATIONS_PAGE_SIZE),
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
