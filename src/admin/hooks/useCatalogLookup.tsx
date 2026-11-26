import { useQuery } from "@tanstack/react-query";
import {
  getCatalogLookupAction,
  type CatalogLookupKind,
} from "../actions/get-catalog-lookup.action";

/**
 * Opciones de un catálogo auxiliar (categorías, marcas, modelos, colores,
 * talles) para los filtros de la grilla. Cambian poco, así que se cachean 5
 * minutos. Los modelos solo se piden con una marca elegida (`brand`).
 */
export const useCatalogLookup = (
  kind: CatalogLookupKind,
  { brand, enabled = true }: { brand?: string; enabled?: boolean } = {},
) => {
  return useQuery({
    queryKey: ["catalog-lookup", kind, brand ?? null],
    queryFn: () => getCatalogLookupAction(kind, brand),
    enabled: enabled && (kind !== "product-models" || !!brand),
    staleTime: 5 * 60_000,
  });
};
