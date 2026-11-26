import { useEffect, useState } from "react";
import { Button } from "@/components/char/button";
import { FiltersPopover } from "@/components/char/filters-popover";
import type {
  FilterDefinition,
  FilterValues,
} from "@/components/char/filters-popover";
import { Pagination } from "@/components/char/pagination";
import { SearchBar } from "@/components/char/search-bar";
import { toast } from "@/components/char/sonner";
import { StateMessage } from "@/components/char/state-message";
import { toApiError } from "@/lib/apiError";
import { useDebounce } from "@/hooks/useDebounce";
import {
  PRODUCT_FILTER_KEYS,
  type ProductFilterKey,
} from "@/admin/actions/get-products.action";
import { ProductDeleteDialog } from "@/admin/components/ProductDeleteDialog";
import { ProductsCardList } from "@/admin/components/ProductsCardList";
import { ProductsTable } from "@/admin/components/ProductsTable";
import { useCatalogLookup } from "@/admin/hooks/useCatalogLookup";
import { useProductList } from "@/admin/hooks/useProducts";
import { useProductsSearchParams } from "@/admin/hooks/useProductsSearchParams";
import type { CatalogLookup } from "@/admin/interfaces/product-variant.interface";
import type { ProductListItem } from "@/admin/interfaces/product.interface";

const toOptions = (items: CatalogLookup[] | undefined) =>
  (items ?? []).map((item) => ({
    value: String(item.id),
    label: item.label ?? item.name,
  }));

/**
 * Vista "Productos" de `ProductsPage`: una fila por **producto** (`GET
 * /products/`, permiso `products.view_product`), con su cantidad de variantes
 * (`variants_count`) y, con `products.view_productvariant`, sus colores y
 * talles. A diferencia de la vista "Variantes", acá aparecen también los
 * productos **sin variantes** (los que todavía no se pueden publicar):
 * el filtro "Sin variantes" los encuentra.
 *
 * Buscador (nombre, slug, marca o modelo; debounce de 300 ms) y un
 * `FiltersPopover` con categoría, marca, modelo (se habilita al elegir una
 * marca y se limpia si ésta cambia), estado de publicación, variantes
 * (`has_variants`), promo vigente y rango de precio vigente. La tabla
 * (`ProductsTable`, desde `md`) ordena por nombre, variantes y precio; en
 * celulares se muestran tarjetas (`ProductsCardList`). Todo vive en la URL
 * (`useProductsSearchParams`) y cualquier cambio vuelve a la página 1. Cubre
 * carga, error (con "Reintentar") y vacío con `StateMessage`. "Eliminar"
 * (`products.delete_product`) usa `ProductDeleteDialog`, que muestra el error
 * del backend dentro del diálogo. El costo nunca se muestra acá.
 */
export const ProductsList = () => {
  const { criteria, page, setCriteria, setPage } = useProductsSearchParams();
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
    useProductList({
      page,
      page_size: criteria.pageSize,
      search: urlSearch,
      ordering: criteria.ordering,
      filters,
    });

  const categories = useCatalogLookup("categories");
  const brands = useCatalogLookup("brands");
  const models = useCatalogLookup("product-models", { brand: filters.brand });

  const [productToDelete, setProductToDelete] =
    useState<ProductListItem | null>(null);

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
      key: "is_published",
      type: "chips",
      label: "Estado",
      options: [
        { value: "true", label: "Publicado" },
        { value: "false", label: "Sin publicar" },
      ],
    },
    {
      key: "has_variants",
      type: "chips",
      label: "Variantes",
      options: [
        { value: "true", label: "Con variantes" },
        { value: "false", label: "Sin variantes" },
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
    !!urlSearch || PRODUCT_FILTER_KEYS.some((key) => filters[key]);

  const clearFilters = () => {
    setSearch("");
    setCriteria({
      search: "",
      filters: Object.fromEntries(PRODUCT_FILTER_KEYS.map((key) => [key, ""])),
    });
  };

  const listProps = {
    products: data?.results ?? [],
    ordering: criteria.ordering,
    onOrderingChange: (ordering: string) => setCriteria({ ordering }),
    loading: isPending,
    dimmed: isPlaceholderData,
    onDelete: setProductToDelete,
  };

  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por nombre, marca o modelo…"
        actions={
          <>
            <FiltersPopover
              filters={filterDefinitions}
              value={filters as FilterValues}
              onChange={(values) =>
                setCriteria({
                  filters: Object.fromEntries(
                    PRODUCT_FILTER_KEYS.map((key) => [key, values[key] ?? ""]),
                  ) as Partial<Record<ProductFilterKey, string>>,
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
            : "Todavía no hay productos."}
        </StateMessage>
      ) : (
        <>
          <ProductsTable {...listProps} className="max-md:hidden" />
          <ProductsCardList {...listProps} className="md:hidden" />
        </>
      )}
      {data ? (
        <Pagination
          page={page}
          pageSize={criteria.pageSize}
          total={data.count}
          itemLabel={{ singular: "producto", plural: "productos" }}
          disabled={isPlaceholderData}
          onPageChange={setPage}
          onPageSizeChange={(pageSize) => setCriteria({ pageSize })}
        />
      ) : null}
      {productToDelete ? (
        <ProductDeleteDialog
          open
          onOpenChange={(open) => !open && setProductToDelete(null)}
          productId={productToDelete.id}
          productName={productToDelete.name}
          onDeleted={() => {
            // Si era el único de la última página, volver a la anterior.
            if (page > 1 && data?.results.length === 1) setPage(page - 1);
            toast.success("Producto eliminado", {
              description: productToDelete.name,
            });
            setProductToDelete(null);
          }}
        />
      ) : null}
    </div>
  );
};
