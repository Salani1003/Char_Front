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
import { useDebounce } from "@/hooks/useDebounce";
import { StockCountsCardList } from "@/admin/components/StockCountsCardList";
import { StockCountsTable } from "@/admin/components/StockCountsTable";
import { STOCK_COUNT_STATUS_OPTIONS } from "@/admin/config/stock-counts";
import { useStockCounts } from "@/admin/hooks/useStockCounts";
import { useStockCountsSearchParams } from "@/admin/hooks/useStockCountsSearchParams";
import { stockErrorMessage } from "@/admin/utils/stock";

const FILTERS: FilterDefinition[] = [
  {
    key: "status",
    type: "chips",
    label: "Estado",
    options: STOCK_COUNT_STATUS_OPTIONS,
  },
  { key: "date_from", type: "date", label: "Creado desde" },
  { key: "date_to", type: "date", label: "Creado hasta" },
];

/**
 * Vista "Recuentos" de `InventoryPage` (permiso `stock.view_stockcount`):
 * lista de recuentos (`GET /stock-counts/`, sin líneas) con buscador (nota;
 * debounce de 300 ms) y `FiltersPopover` de estado y fecha de creación
 * (inclusiva, en UTC). La tabla (`StockCountsTable`, desde `md`) ordena por
 * creación y confirmación; en celulares se muestran tarjetas. Cada fila abre
 * `StockCountPage`. El alta es `NewStockCountButton` en el encabezado.
 *
 * Criterios, orden, página y tamaño viven en la URL
 * (`useStockCountsSearchParams`) y cualquier cambio vuelve a la página 1.
 * Cubre carga, error (con "Reintentar") y vacío con `StateMessage`.
 */
export const StockCountsList = () => {
  const { criteria, page, setCriteria, setPage } = useStockCountsSearchParams();
  const { search: urlSearch, status, dateFrom, dateTo } = criteria;

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
    useStockCounts({
      page,
      page_size: criteria.pageSize,
      search: urlSearch,
      ordering: criteria.ordering,
      status,
      date_from: dateFrom,
      date_to: dateTo,
    });

  const hasFilters = !!(urlSearch || status || dateFrom || dateTo);
  const filterValues: FilterValues = {
    status,
    date_from: dateFrom,
    date_to: dateTo,
  };

  const clearFilters = () => {
    setSearch("");
    setCriteria({ search: "", status: "", dateFrom: "", dateTo: "" });
  };

  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por nota…"
        actions={
          <>
            <FiltersPopover
              filters={FILTERS}
              value={filterValues}
              onChange={(values) =>
                setCriteria({
                  status: values.status ?? "",
                  dateFrom: values.date_from ?? "",
                  dateTo: values.date_to ?? "",
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
          {stockErrorMessage(error)}
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
            ? "No hay recuentos con esos filtros."
            : "Todavía no hay recuentos."}
        </StateMessage>
      ) : (
        <>
          <StockCountsTable
            counts={data?.results ?? []}
            ordering={criteria.ordering}
            onOrderingChange={(ordering) => setCriteria({ ordering })}
            loading={isPending}
            dimmed={isPlaceholderData}
            className="max-md:hidden"
          />
          <StockCountsCardList
            counts={data?.results ?? []}
            loading={isPending}
            dimmed={isPlaceholderData}
            className="md:hidden"
          />
        </>
      )}
      {data ? (
        <Pagination
          page={page}
          pageSize={criteria.pageSize}
          total={data.count}
          itemLabel={{ singular: "recuento", plural: "recuentos" }}
          disabled={isPlaceholderData}
          onPageChange={setPage}
          onPageSizeChange={(pageSize) => setCriteria({ pageSize })}
        />
      ) : null}
    </div>
  );
};
