import { charApi } from "@/lib/charApi";
import type { Paginated } from "../interfaces/paginated.interface";
import type { ProductListItem } from "../interfaces/product.interface";

/** Filtros del listado de productos; cada clave es el nombre del parámetro de la API. */
export const PRODUCT_FILTER_KEYS = [
  "category",
  "brand",
  "product_model",
  "is_published",
  "on_promo",
  "has_variants",
  "min_price",
  "max_price",
] as const;

export type ProductFilterKey = (typeof PRODUCT_FILTER_KEYS)[number];

export interface GetProductsParams {
  /** Página a pedir (empieza en 1); por defecto 1. */
  page?: number;
  /** Resultados por página (default del backend 20, máx 100). */
  page_size?: number;
  /** Busca en nombre, slug, marca y modelo. */
  search?: string;
  /** Campo de orden; prefijo `-` = descendente. Vacío = orden del backend. */
  ordering?: string;
  /** Filtros combinables; los vacíos no se envían. */
  filters?: Partial<Record<ProductFilterKey, string>>;
}

/**
 * Lista los productos (`GET /products/`) con paginación, búsqueda, orden y
 * filtros. Los parámetros vacíos no se envían. Cada producto trae
 * `variants_count` y, con `products.view_productvariant`, sus `variants`.
 */
export const getProductsAction = async ({
  page = 1,
  page_size,
  search,
  ordering,
  filters = {},
}: GetProductsParams = {}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (page_size) params.set("page_size", String(page_size));
  if (search) params.set("search", search);
  if (ordering) params.set("ordering", ordering);
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  const { data } = await charApi.get<Paginated<ProductListItem>>("/products/", {
    params,
  });
  return data;
};
