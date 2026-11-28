import { useSearchParams } from "react-router";
import { DOC_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS } from "../config/sales";

/** Tamaño de página por defecto del backend. */
export const DEFAULT_EXCHANGES_PAGE_SIZE = 20;
/** Tamaños de página elegibles (el backend admite hasta 100). */
export const EXCHANGES_PAGE_SIZES = [10, 20, 50, 100];
/** Campos por los que admite ordenar el backend (por defecto: más nuevos primero). */
export const EXCHANGES_ORDERING_FIELDS = [
  "created_at",
  "difference",
  "id",
] as const;

/** Criterios del listado de cambios que se reflejan en la URL. */
export interface ExchangesCriteria {
  search: string;
  /** `completada`, `anulada` o `""`. */
  status: string;
  paymentMethod: string;
  /** Número de la venta de origen, o `""`. */
  sale: string;
  /** `YYYY-MM-DD` o `""`. */
  dateFrom: string;
  dateTo: string;
  /** `""` = el del backend (más nuevos primero). */
  ordering: string;
  pageSize: number;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DIGITS = /^\d{1,10}$/;
const isOrdering = (value: string) =>
  (EXCHANGES_ORDERING_FIELDS as readonly string[]).includes(
    value.replace(/^-/, ""),
  );

/**
 * Estado del listado de cambios guardado en la query string: `q`, `status`,
 * `payment_method`, `sale`, `date_from`, `date_to`, `ordering`, `page` y
 * `page_size`. Todo valor inválido se ignora y los valores por defecto no se
 * escriben. `setCriteria` vuelve a la página 1; `setPage` solo cambia la
 * página. Conserva el resto de la query (la pestaña `view`).
 */
export function useExchangesSearchParams() {
  const [params, setParams] = useSearchParams();

  const pick = (key: string, valid: (v: string) => boolean) => {
    const raw = params.get(key) ?? "";
    return valid(raw) ? raw : "";
  };
  const rawPageSize = Number(params.get("page_size"));
  const rawPage = Number(params.get("page"));

  const criteria: ExchangesCriteria = {
    search: params.get("q") ?? "",
    status: pick("status", (v) =>
      DOC_STATUS_OPTIONS.some((o) => o.value === v),
    ),
    paymentMethod: pick("payment_method", (v) =>
      PAYMENT_METHOD_OPTIONS.some((o) => o.value === v),
    ),
    sale: pick("sale", (v) => DIGITS.test(v)),
    dateFrom: pick("date_from", (v) => DATE.test(v)),
    dateTo: pick("date_to", (v) => DATE.test(v)),
    ordering: pick("ordering", isOrdering),
    pageSize: EXCHANGES_PAGE_SIZES.includes(rawPageSize)
      ? rawPageSize
      : DEFAULT_EXCHANGES_PAGE_SIZE,
  };
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  const setCriteria = (
    changes: Partial<ExchangesCriteria>,
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
        if (changes.sale !== undefined) set("sale", changes.sale.trim());
        if (changes.dateFrom !== undefined) set("date_from", changes.dateFrom);
        if (changes.dateTo !== undefined) set("date_to", changes.dateTo);
        if (changes.ordering !== undefined) set("ordering", changes.ordering);
        if (changes.pageSize !== undefined)
          set(
            "page_size",
            String(changes.pageSize),
            String(DEFAULT_EXCHANGES_PAGE_SIZE),
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
