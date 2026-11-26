import { charApi } from "@/lib/charApi";
import type { Paginated } from "../interfaces/paginated.interface";
import type { ProductVariant } from "../interfaces/product-variant.interface";

/** Filtros de la grilla; cada clave es el nombre del parámetro de la API. */
export const PRODUCT_VARIANT_FILTER_KEYS = [
  "category",
  "brand",
  "product_model",
  "color",
  "size",
  "is_published",
  "on_promo",
  "min_price",
  "max_price",
] as const;

export type ProductVariantFilterKey =
  (typeof PRODUCT_VARIANT_FILTER_KEYS)[number];

export interface GetProductVariantsParams {
  /** Página a pedir (empieza en 1); por defecto 1. */
  page?: number;
  /** Resultados por página (default del backend 20, máx 100). */
  page_size?: number;
  /** Busca en SKU, producto, marca, modelo, color y talle. */
  search?: string;
  /** Campo de orden; prefijo `-` = descendente. Vacío = orden del backend. */
  ordering?: string;
  /** Filtros combinables; los vacíos no se envían. */
  filters?: Partial<Record<ProductVariantFilterKey, string>>;
}

/**
 * Lista las variantes activas (`GET /product-variants/`) con paginación,
 * búsqueda, orden y filtros. Los parámetros vacíos no se envían.
 */
export const getProductVariantsAction = async ({
  page = 1,
  page_size,
  search,
  ordering,
  filters = {},
}: GetProductVariantsParams = {}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (page_size) params.set("page_size", String(page_size));
  if (search) params.set("search", search);
  if (ordering) params.set("ordering", ordering);
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  const { data } = await charApi.get<Paginated<ProductVariant>>(
    "/product-variants/",
    { params },
  );
  return data;
};
