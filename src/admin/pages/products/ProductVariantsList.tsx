import { useEffect, useState } from "react";
import { Button } from "@/components/char/button";
import { FiltersPopover } from "@/components/char/filters-popover";
import type {
  FilterDefinition,
  FilterValues,
} from "@/components/char/filters-popover";
import { Pagination } from "@/components/char/pagination";
import { SearchBar } from "@/components/char/search-bar";
import { StateMessage } from "@/components/char/state-message";
import { toApiError } from "@/lib/apiError";
import { useDebounce } from "@/hooks/useDebounce";
import { ProductVariantsCardList } from "@/admin/components/ProductVariantsCardList";
import { ProductVariantsTable } from "@/admin/components/ProductVariantsTable";
import {
  PRODUCT_VARIANT_FILTER_KEYS,
  type ProductVariantFilterKey,
} from "@/admin/actions/get-product-variants.action";
import { useCatalogLookup } from "@/admin/hooks/useCatalogLookup";
import { useCatalogSearchParams } from "@/admin/hooks/useCatalogSearchParams";
import { useProductVariants } from "@/admin/hooks/useProductVariants";
import type { CatalogLookup } from "@/admin/interfaces/product-variant.interface";

const toOptions = (items: CatalogLookup[] | undefined) =>
  (items ?? []).map((item) => ({
    value: String(item.id),
    label: item.label ?? item.name,
  }));

/**
 * Vista "Variantes" de `ProductsPage`: una fila por **variante** de producto
 * (SKU, producto, color, talle, precio vigente y estado) con nombres y
 * precios ya resueltos (`GET /product-variants/`; requiere
 * `products.view_productvariant`). El nombre de cada fila lleva a la edición
 * de su producto. No muestra productos sin variantes: para eso está la vista
 * "Productos" (`ProductsList`).
 *
 * Tiene buscador (SKU, producto, marca, modelo, color o talle; con debounce de
 * 300 ms) y un `FiltersPopover` con categoría (solo asignables), marca, modelo
 * (se habilita al elegir una marca y se limpia si ésta cambia), color, talle,
 * estado de publicación, promo vigente y rango de precio vigente (inclusivo).
 * Las opciones de los selects salen de los catálogos auxiliares
 * (`useCatalogLookup`). La tabla (`ProductVariantsTable`, desde `md`) ordena
 * por columna y en celulares se muestran tarjetas (`ProductVariantsCardList`).
 *
 * Todos los criterios (búsqueda, filtros, orden, página y tamaño) viven en la
 * URL (`useCatalogSearchParams`) y cualquier cambio vuelve a la página 1.
 * Cubre carga, error (con "Reintentar") y vacío con `StateMessage`; el listado
 * se atenúa mientras `isPlaceholderData`.
 */
export const ProductVariantsList = () => {
  const { criteria, page, setCriteria, setPage } = useCatalogSearchParams();
  const { search: urlSearch, filters } = criteria;

  // El texto se edita localmente y llega a la URL (y a la request) con debounce.
  const [search, setSearch] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    if (urlSearch !== search.trim()) setSearch(urlSearch);
  }
  const debouncedSearch = useDebounce(search);
  useEffect(() => {
    if (debouncedSearch === search && debouncedSearch.trim() !== urlSearch) {
      setCriteria({ search: debouncedSearch }, { replace: true });
    }
  }, [debouncedSearch, search, urlSearch, setCriteria]);

  const { data, isPending, isError, error, isPlaceholderData, refetch } =
    useProductVariants({
      page,
      page_size: criteria.pageSize,
      search: urlSearch,
      ordering: criteria.ordering,
      filters,
    });

  const categories = useCatalogLookup("categories");
  const brands = useCatalogLookup("brands");
  const models = useCatalogLookup("product-models", { brand: filters.brand });
  const colors = useCatalogLookup("colors");
  const sizes = useCatalogLookup("sizes");

  const filterDefinitions: FilterDefinition[] = [
    {
      key: "category",
      type: "select",
      label: "Categoría",
      options: toOptions(categories.data),
    },
    {
      key: "brand",
      type: "select",
      label: "Marca",
      options: toOptions(brands.data),
    },
    // El modelo depende de la marca: sin marca no hay opciones que ofrecer.
    ...(filters.brand
      ? ([
          {
            key: "product_model",
            type: "select",
            label: "Modelo",
            options: toOptions(models.data),
          },
        ] satisfies FilterDefinition[])
      : []),
    {
      key: "color",
      type: "select",
      label: "Color",
      options: toOptions(colors.data),
    },
    {
      key: "size",
      type: "select",
      label: "Talle",
      options: toOptions(sizes.data),
    },
    {
      key: "is_published",
      type: "chips",
      label: "Estado",
      options: [
        { value: "true", label: "Publicado" },
        { value: "false", label: "Borrador" },
      ],
    },
    {
      key: "on_promo",
      type: "chips",
      label: "Promo vigente",
      options: [
        { value: "true", label: "Con promo" },
        { value: "false", label: "Sin promo" },
      ],
    },
    {
      key: "min_price",
      type: "text",
      label: "Precio desde",
      placeholder: "0",
    },
    {
      key: "max_price",
      type: "text",
      label: "Precio hasta",
      placeholder: "0",
    },
  ];

  const hasFilters =
    !!urlSearch || PRODUCT_VARIANT_FILTER_KEYS.some((key) => filters[key]);

  const clearFilters = () => {
    setSearch("");
    setCriteria({
      search: "",
      filters: Object.fromEntries(
        PRODUCT_VARIANT_FILTER_KEYS.map((key) => [key, ""]),
      ),
    });
  };

  const listProps = {
    variants: data?.results ?? [],
    ordering: criteria.ordering,
    onOrderingChange: (ordering: string) => setCriteria({ ordering }),
    loading: isPending,
    dimmed: isPlaceholderData,
  };

  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por SKU, producto, marca, color o talle…"
        actions={
          <>
            <FiltersPopover
              filters={filterDefinitions}
              value={filters as FilterValues}
              onChange={(values) =>
                setCriteria({
                  filters: Object.fromEntries(
                    PRODUCT_VARIANT_FILTER_KEYS.map((key) => [
                      key,
                      values[key] ?? "",
                    ]),
                  ) as Partial<Record<ProductVariantFilterKey, string>>,
                })
              }
            />
            {hasFilters ? (
              <Button variant="ghost" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : null}
          </>
        }
      />
      {isError ? (
        <StateMessage
          variant="error"
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        >
          {toApiError(error).message}
        </StateMessage>
      ) : data && data.results.length === 0 ? (
        <StateMessage
          variant="empty"
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        >
          {hasFilters
            ? "Sin resultados para los filtros."
            : "El catálogo todavía no tiene variantes."}
        </StateMessage>
      ) : (
        <>
          <ProductVariantsTable {...listProps} className="max-md:hidden" />
          <ProductVariantsCardList {...listProps} className="md:hidden" />
        </>
      )}
      {data ? (
        <Pagination
          page={page}
          pageSize={criteria.pageSize}
          total={data.count}
          itemLabel={{ singular: "variante", plural: "variantes" }}
          disabled={isPlaceholderData}
          onPageChange={setPage}
          onPageSizeChange={(pageSize) => setCriteria({ pageSize })}
        />
      ) : null}
    </div>
  );
};
