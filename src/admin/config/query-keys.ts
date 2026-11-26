import type { QueryParamValue } from "../utils/toSearchParams";

/**
 * Claves de TanStack Query del módulo de productos, una fábrica por recurso.
 * Toda invalidación parte de `all` (prefijo): invalidar `all` refresca listas
 * y detalles de ese recurso. Las claves de catálogo no se escriben a mano en
 * otro lado.
 */

/** Parámetros de un listado, parte de la clave para cachear cada combinación. */
type ListParams = Record<string, QueryParamValue>;

const catalogKeys = <Name extends string>(name: Name) => ({
  all: [name] as const,
  lists: () => [name, "list"] as const,
  list: (params: ListParams = {}) => [name, "list", params] as const,
  /** Todas las páginas juntas (`getAllPages`). */
  allPages: (params: ListParams = {}) => [name, "all-pages", params] as const,
  detail: (id: number | null) => [name, "detail", id] as const,
});

export const categoryKeys = catalogKeys("categories");
export const brandKeys = catalogKeys("brands");
export const productModelKeys = catalogKeys("product-models");
export const colorKeys = catalogKeys("colors");
export const sizeKeys = catalogKeys("sizes");

export const productKeys = {
  all: ["products"] as const,
  detail: (id: number | null) => ["products", "detail", id] as const,
  withVariants: (id: number | null) =>
    ["products", "with-variants", id] as const,
};

/**
 * Variantes. `all` es el prefijo de la grilla del Catálogo
 * (`useProductVariants`), que muestra producto, precio y publicación: se
 * invalida cuando cambian variantes o productos.
 */
export const productVariantKeys = {
  all: ["product-variants"] as const,
};

/** Opciones de filtro de la grilla del Catálogo (`useCatalogLookup`); se invalidan al crear registros de catálogo. */
export const catalogLookupKeys = {
  all: ["catalog-lookup"] as const,
};
