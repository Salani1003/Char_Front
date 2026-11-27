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
import { StockOperationsCardList } from "@/admin/components/StockOperationsCardList";
import { StockOperationsTable } from "@/admin/components/StockOperationsTable";
import {
  STOCK_KIND_OPTIONS,
  STOCK_REASON_OPTIONS,
} from "@/admin/config/stock-operations";
import { useStockOperations } from "@/admin/hooks/useStockOperations";
import { useStockOperationsSearchParams } from "@/admin/hooks/useStockOperationsSearchParams";
import { stockErrorMessage } from "@/admin/utils/stock";

const FILTERS: FilterDefinition[] = [
  { key: "kind", type: "chips", label: "Tipo", options: STOCK_KIND_OPTIONS },
  {
    key: "reason",
    type: "select",
    label: "Motivo",
    options: STOCK_REASON_OPTIONS,
  },
  { key: "date_from", type: "date", label: "Desde" },
  { key: "date_to", type: "date", label: "Hasta" },
];

/**
 * Vista "Historial" de `InventoryPage` (permiso `stock.view_stockmovement`):
 * una fila por **operación** (`GET /stock-operations/`), no por variante; el
 * detalle con las líneas está en `StockOperationPage`. Buscador (nota, SKU o
 * producto de alguna línea; debounce de 300 ms) y `FiltersPopover` con tipo,
 * motivo y rango de fechas (inclusivo; el servidor las interpreta en UTC, así
 * que una operación de la noche en Argentina puede caer al día siguiente). La
 * tabla (`StockOperationsTable`, desde `md`) ordena por fecha, variantes y
 * unidades; en celulares se muestran tarjetas.
 *
 * Criterios, orden, página y tamaño viven en la URL
 * (`useStockOperationsSearchParams`) y cualquier cambio vuelve a la página 1.
 * Cubre carga, error (con "Reintentar") y vacío con `StateMessage`.
 */
export const StockHistoryList = () => {
  const { criteria, page, setCriteria, setPage } =
    useStockOperationsSearchParams();
  const { search: urlSearch, kind, reason, dateFrom, dateTo } = criteria;

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
    useStockOperations({
      page,
      page_size: criteria.pageSize,
      search: urlSearch,
      ordering: criteria.ordering,
      kind,
      reason,
      date_from: dateFrom,
      date_to: dateTo,
    });

  const hasFilters = !!(urlSearch || kind || reason || dateFrom || dateTo);
  const filterValues: FilterValues = {
    kind,
    reason,
    date_from: dateFrom,
    date_to: dateTo,
  };

  const clearFilters = () => {
    setSearch("");
    setCriteria({
      search: "",
      kind: "",
      reason: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const listProps = {
    operations: data?.results ?? [],
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
        placeholder="Buscar por nota, SKU o producto…"
        actions={
          <>
            <FiltersPopover
              filters={FILTERS}
              value={filterValues}
              onChange={(values) =>
                setCriteria({
                  kind: values.kind ?? "",
                  reason: values.reason ?? "",
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
            ? "No hay operaciones con esos filtros."
            : "Todavía no hay operaciones de stock."}
        </StateMessage>
      ) : (
        <>
          <StockOperationsTable {...listProps} className="max-md:hidden" />
          <StockOperationsCardList {...listProps} className="md:hidden" />
        </>
      )}
      {data ? (
        <Pagination
          page={page}
          pageSize={criteria.pageSize}
          total={data.count}
          itemLabel={{ singular: "operación", plural: "operaciones" }}
          disabled={isPlaceholderData}
          onPageChange={setPage}
          onPageSizeChange={(pageSize) => setCriteria({ pageSize })}
        />
      ) : null}
    </div>
  );
};
