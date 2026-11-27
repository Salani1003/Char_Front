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
import { StockCardList } from "@/admin/components/StockCardList";
import { StockSummaryCards } from "@/admin/components/StockSummaryCards";
import { StockTable } from "@/admin/components/StockTable";
import {
  STOCK_ID_FILTER_KEYS,
  type StockIdFilterKey,
} from "@/admin/actions/stock.action";
import { useCatalogLookup } from "@/admin/hooks/useCatalogLookup";
import { useStock, useStockSummary } from "@/admin/hooks/useStock";
import { useStockSearchParams } from "@/admin/hooks/useStockSearchParams";
import type { CatalogLookup } from "@/admin/interfaces/product-variant.interface";

const toOptions = (items: CatalogLookup[] | undefined) =>
  (items ?? []).map((item) => ({
    value: String(item.id),
    label: item.label ?? item.name,
  }));

/**
 * Vista "Stock" de `InventoryPage`: saldo de cada variante activa
 * (`GET /stock/`, permiso `stock.view_stocklevel`), tenga o no movimientos.
 *
 * Arriba, `StockSummaryCards` (`GET /stock/summary/`: totales de todas las
 * variantes, sin filtros) que además filtran por estado (sin stock, stock
 * bajo, con stock). Debajo, el buscador (SKU, producto, marca, color o talle;
 * debounce de 300 ms) con un `FiltersPopover` de categoría (solo asignables),
 * marca, color y talle, cuyas opciones salen de los catálogos auxiliares
 * (`useCatalogLookup`). La tabla (`StockTable`, desde `md`) ordena por
 * columna y en celulares se muestran tarjetas (`StockCardList`). El stock
 * mínimo se edita en la fila (`StockMinInput`).
 *
 * Todos los criterios (búsqueda, estado, filtros, orden, página y tamaño)
 * viven en la URL (`useStockSearchParams`) y cualquier cambio vuelve a la
 * página 1. Cubre carga, error (con "Reintentar") y vacío con `StateMessage`;
 * el listado se atenúa mientras `isPlaceholderData`.
 */
export const StockList = () => {
  const { criteria, page, setCriteria, setPage } = useStockSearchParams();
  const { search: urlSearch, filters, status } = criteria;

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
    useStock({
      page,
      page_size: criteria.pageSize,
      search: urlSearch,
      ordering: criteria.ordering,
      status,
      filters,
    });
  const { data: summary } = useStockSummary();

  const categories = useCatalogLookup("categories");
  const brands = useCatalogLookup("brands");
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
  ];

  const hasFilters =
    !!urlSearch ||
    status !== "all" ||
    STOCK_ID_FILTER_KEYS.some((key) => filters[key]);

  const clearFilters = () => {
    setSearch("");
    setCriteria({
      search: "",
      status: "all",
      filters: Object.fromEntries(STOCK_ID_FILTER_KEYS.map((key) => [key, ""])),
    });
  };

  const listProps = {
    levels: data?.results ?? [],
    ordering: criteria.ordering,
    onOrderingChange: (ordering: string) => setCriteria({ ordering }),
    loading: isPending,
    dimmed: isPlaceholderData,
  };

  return (
    <div className="flex flex-col gap-6">
      <StockSummaryCards
        summary={summary}
        status={status}
        onStatusChange={(next) => setCriteria({ status: next })}
      />
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
                    STOCK_ID_FILTER_KEYS.map((key) => [key, values[key] ?? ""]),
                  ) as Partial<Record<StockIdFilterKey, string>>,
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
            ? "Ninguna variante coincide con los filtros."
            : "Todavía no hay variantes con stock para mostrar."}
        </StateMessage>
      ) : (
        <>
          <StockTable {...listProps} className="max-md:hidden" />
          <StockCardList {...listProps} className="md:hidden" />
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
