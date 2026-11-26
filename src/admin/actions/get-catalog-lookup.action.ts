import { charApi } from "@/lib/charApi";
import type { CatalogLookup } from "../interfaces/product-variant.interface";
import type { Paginated } from "../interfaces/paginated.interface";

/** Catálogo auxiliar que alimenta un filtro de la grilla. */
export type CatalogLookupKind =
  "categories" | "brands" | "product-models" | "colors" | "sizes";

const QUERIES: Record<CatalogLookupKind, string> = {
  categories: "leaf=true&page_size=100",
  brands: "page_size=100",
  "product-models": "page_size=100",
  colors: "page_size=100",
  sizes: "page_size=100",
};

/**
 * Lista un catálogo auxiliar (`/categories/?leaf=true`, `/brands/`,
 * `/product-models/?brand=<id>`, `/colors/`, `/sizes/`) para armar filtros.
 * Los talles y colores ya vienen ordenados por el backend. `brand` solo aplica
 * a `product-models`.
 */
export const getCatalogLookupAction = async (
  kind: CatalogLookupKind,
  brand?: string,
) => {
  const params = new URLSearchParams(QUERIES[kind]);
  if (kind === "product-models" && brand) params.set("brand", brand);
  const { data } = await charApi.get<Paginated<CatalogLookup>>(`/${kind}/`, {
    params,
  });
  return data.results;
};
