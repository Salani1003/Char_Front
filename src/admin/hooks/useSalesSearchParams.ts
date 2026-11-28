import { useSearchParams } from "react-router";
import { DOC_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS } from "../config/sales";

/** Tamaño de página por defecto del backend. */
export const DEFAULT_SALES_PAGE_SIZE = 20;
/** Tamaños de página elegibles (el backend admite hasta 100). */
export const SALES_PAGE_SIZES = [10, 20, 50, 100];
/** Campos por los que admite ordenar el backend (por defecto: más nuevas primero). */
export const SALES_ORDERING_FIELDS = ["created_at", "total", "id"] as const;

/** Criterios del listado de ventas que se reflejan en la URL. */
export interface SalesCriteria {
  search: string;
  /** `completada`, `anulada` o `""`. */
  status: string;
  paymentMethod: string;
  /** `YYYY-MM-DD` o `""`. */
  dateFrom: string;
  dateTo: string;
  /** `true`, `false` o `""`. */
  hasDiscount: string;
  hasExchanges: string;
  /** Importe decimal (`"1500"` o `"1500.50"`) o `""`. */
  minTotal: string;
  maxTotal: string;
  /** `""` = el del backend (más nuevas primero). */
  ordering: string;
  pageSize: number;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const AMOUNT = /^\d{1,10}(\.\d{1,2})?$/;
const BOOL = ["true", "false"];
const isOrdering = (value: string) =>
  (SALES_ORDERING_FIELDS as readonly string[]).includes(
    value.replace(/^-/, ""),
  );

/**
 * Estado del listado de ventas guardado en la query string: `q`, `status`,
 * `payment_method`, `date_from`, `date_to`, `has_discount`, `has_exchanges`,
 * `min_total`, `max_total`, `ordering`, `page` y `page_size`. Todo valor
 * inválido se ignora y los valores por defecto no se escriben. `setCriteria`
 * vuelve a la página 1; `setPage` solo cambia la página. Con `replace` no
 * agrega una entrada al historial del navegador. La pestaña (`view`) no es un
 * criterio: la maneja `SalesPage`, que descarta todo esto al cambiarla.
 */
export function useSalesSearchParams() {
  const [params, setParams] = useSearchParams();

  const pick = (key: string, valid: (v: string) => boolean) => {
    const raw = params.get(key) ?? "";
    return valid(raw) ? raw : "";
  };
  const rawPageSize = Number(params.get("page_size"));
  const rawPage = Number(params.get("page"));

  const criteria: SalesCriteria = {
    search: params.get("q") ?? "",
    status: pick("status", (v) =>
      DOC_STATUS_OPTIONS.some((o) => o.value === v),
    ),
    paymentMethod: pick("payment_method", (v) =>
      PAYMENT_METHOD_OPTIONS.some((o) => o.value === v),
    ),
    dateFrom: pick("date_from", (v) => DATE.test(v)),
    dateTo: pick("date_to", (v) => DATE.test(v)),
    hasDiscount: pick("has_discount", (v) => BOOL.includes(v)),
    hasExchanges: pick("has_exchanges", (v) => BOOL.includes(v)),
    minTotal: pick("min_total", (v) => AMOUNT.test(v)),
    maxTotal: pick("max_total", (v) => AMOUNT.test(v)),
    ordering: pick("ordering", isOrdering),
    pageSize: SALES_PAGE_SIZES.includes(rawPageSize)
      ? rawPageSize
      : DEFAULT_SALES_PAGE_SIZE,
  };
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  const setCriteria = (
    changes: Partial<SalesCriteria>,
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
        if (changes.paymentMethod !== undefined)
          set("payment_method", changes.paymentMethod);
        if (changes.dateFrom !== undefined) set("date_from", changes.dateFrom);
        if (changes.dateTo !== undefined) set("date_to", changes.dateTo);
        if (changes.hasDiscount !== undefined)
          set("has_discount", changes.hasDiscount);
        if (changes.hasExchanges !== undefined)
          set("has_exchanges", changes.hasExchanges);
        if (changes.minTotal !== undefined)
          set("min_total", changes.minTotal.trim());
        if (changes.maxTotal !== undefined)
          set("max_total", changes.maxTotal.trim());
        if (changes.ordering !== undefined) set("ordering", changes.ordering);
        if (changes.pageSize !== undefined)
          set(
            "page_size",
            String(changes.pageSize),
            String(DEFAULT_SALES_PAGE_SIZE),
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
