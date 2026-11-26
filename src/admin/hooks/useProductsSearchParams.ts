import { useSearchParams } from "react-router";
import {
  PRODUCT_FILTER_KEYS,
  type ProductFilterKey,
} from "../actions/get-products.action";

/** Tamaño de página por defecto del backend. */
export const DEFAULT_PRODUCT_PAGE_SIZE = 20;
/** Tamaños de página elegibles (el backend admite hasta 100). */
export const PRODUCT_PAGE_SIZES = [10, 20, 50, 100];
/** Campos por los que admite ordenar el backend. */
export const PRODUCT_ORDERING_FIELDS = [
  "name",
  "sale_price",
  "effective_price",
  "created_at",
  "variants_count",
] as const;

/** Criterios del listado de productos que se reflejan en la URL. */
export interface ProductsCriteria {
  search: string;
  /** Filtros activos por nombre de parámetro; los inactivos son `""`. */
  filters: Record<ProductFilterKey, string>;
  /** Campo de orden (prefijo `-` = descendente); `""` = orden del backend. */
  ordering: string;
  pageSize: number;
}

const ID = /^\d+$/;
const PRICE = /^\d+(\.\d{1,2})?$/;
const BOOL = /^(true|false)$/;
const FILTER_VALIDATORS: Record<ProductFilterKey, RegExp> = {
  category: ID,
  brand: ID,
  product_model: ID,
  is_published: BOOL,
  on_promo: BOOL,
  has_variants: BOOL,
  min_price: PRICE,
  max_price: PRICE,
};
const isOrdering = (value: string) =>
  (PRODUCT_ORDERING_FIELDS as readonly string[]).includes(
    value.replace(/^-/, ""),
  );

/**
 * Estado del listado de productos (vista "Productos") guardado en la query string de la URL (para
 * compartir o recargar): `q`, un parámetro por filtro (con el mismo nombre que
 * en la API), `ordering`, `page` y `page_size`. Todo valor inválido se ignora
 * y los valores por defecto no se escriben. `product_model` solo es válido con
 * `brand`.
 *
 * `setCriteria` cambia uno o varios criterios (`filters` se fusiona con los
 * actuales) y vuelve a la página 1; `setPage` solo cambia la página. Con
 * `replace` no agrega una entrada al historial.
 */
export function useProductsSearchParams() {
  const [params, setParams] = useSearchParams();

  const filters = {} as Record<ProductFilterKey, string>;
  for (const key of PRODUCT_FILTER_KEYS) {
    const value = params.get(key) ?? "";
    filters[key] = FILTER_VALIDATORS[key].test(value) ? value : "";
  }
  if (!filters.brand) filters.product_model = "";
  const rawOrdering = params.get("ordering") ?? "";
  const rawPageSize = Number(params.get("page_size"));
  const rawPage = Number(params.get("page"));

  const criteria: ProductsCriteria = {
    search: params.get("q") ?? "",
    filters,
    ordering: isOrdering(rawOrdering) ? rawOrdering : "",
    pageSize: PRODUCT_PAGE_SIZES.includes(rawPageSize)
      ? rawPageSize
      : DEFAULT_PRODUCT_PAGE_SIZE,
  };
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  const setCriteria = (
    changes: Partial<Omit<ProductsCriteria, "filters">> & {
      filters?: Partial<Record<ProductFilterKey, string>>;
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
        if (changes.ordering !== undefined) set("ordering", changes.ordering);
        if (changes.pageSize !== undefined)
          set(
            "page_size",
            String(changes.pageSize),
            String(DEFAULT_PRODUCT_PAGE_SIZE),
          );
        for (const [key, value] of Object.entries(changes.filters ?? {}))
          set(key, value);
        // Sin marca no hay modelo: si cambia la marca, el modelo elegido deja de valer.
        if (
          changes.filters &&
          "brand" in changes.filters &&
          !("product_model" in changes.filters)
        )
          next.delete("product_model");
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
