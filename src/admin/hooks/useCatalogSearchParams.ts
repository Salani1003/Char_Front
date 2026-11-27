import { useSearchParams } from "react-router";
import {
  PRODUCT_VARIANT_FILTER_KEYS,
  type ProductVariantFilterKey,
} from "../actions/get-product-variants.action";

/** Tamaño de página por defecto del backend. */
export const DEFAULT_CATALOG_PAGE_SIZE = 20;
/** Tamaños de página elegibles (el backend admite hasta 100). */
export const CATALOG_PAGE_SIZES = [10, 20, 50, 100];
/** Campos por los que admite ordenar el backend. */
export const CATALOG_ORDERING_FIELDS = [
  "sku",
  "created_at",
  "product__name",
  "color__name",
  "size__order",
  "effective_price",
  "product__sale_price",
  "quantity",
] as const;

/** Criterios de la grilla de catálogo que se reflejan en la URL. */
export interface CatalogCriteria {
  search: string;
  /** Filtros activos por nombre de parámetro; los inactivos son `""`. */
  filters: Record<ProductVariantFilterKey, string>;
  /** Campo de orden (prefijo `-` = descendente); `""` = orden del backend. */
  ordering: string;
  pageSize: number;
}

const ID = /^\d+$/;
const PRICE = /^\d+(\.\d{1,2})?$/;
const BOOL = /^(true|false)$/;
const FILTER_VALIDATORS: Record<ProductVariantFilterKey, RegExp> = {
  category: ID,
  brand: ID,
  product_model: ID,
  color: ID,
  size: ID,
  is_published: BOOL,
  on_promo: BOOL,
  min_price: PRICE,
  max_price: PRICE,
};
const isOrdering = (value: string) =>
  (CATALOG_ORDERING_FIELDS as readonly string[]).includes(
    value.replace(/^-/, ""),
  );

/**
 * Estado de la grilla de catálogo guardado en la query string de la URL (para
 * compartir o recargar): `q`, un parámetro por filtro (con el mismo nombre que
 * en la API), `ordering`, `page` y `page_size`. Todo valor inválido se ignora
 * y los valores por defecto no se escriben. `product_model` solo es válido con
 * `brand`.
 *
 * `setCriteria` cambia uno o varios criterios (`filters` se fusiona con los
 * actuales) y vuelve a la página 1; `setPage` solo cambia la página. Con
 * `replace` no agrega una entrada al historial.
 */
export function useCatalogSearchParams() {
  const [params, setParams] = useSearchParams();

  const filters = {} as Record<ProductVariantFilterKey, string>;
  for (const key of PRODUCT_VARIANT_FILTER_KEYS) {
    const value = params.get(key) ?? "";
    filters[key] = FILTER_VALIDATORS[key].test(value) ? value : "";
  }
  if (!filters.brand) filters.product_model = "";
  const rawOrdering = params.get("ordering") ?? "";
  const rawPageSize = Number(params.get("page_size"));
  const rawPage = Number(params.get("page"));

  const criteria: CatalogCriteria = {
    search: params.get("q") ?? "",
    filters,
    ordering: isOrdering(rawOrdering) ? rawOrdering : "",
    pageSize: CATALOG_PAGE_SIZES.includes(rawPageSize)
      ? rawPageSize
      : DEFAULT_CATALOG_PAGE_SIZE,
  };
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  const setCriteria = (
    changes: Partial<Omit<CatalogCriteria, "filters">> & {
      filters?: Partial<Record<ProductVariantFilterKey, string>>;
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
            String(DEFAULT_CATALOG_PAGE_SIZE),
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
