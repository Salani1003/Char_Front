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
import { ExchangesCardList } from "@/admin/components/ExchangesCardList";
import { ExchangesTable } from "@/admin/components/ExchangesTable";
import {
  DOC_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from "@/admin/config/sales";
import { useExchanges } from "@/admin/hooks/useExchanges";
import { useExchangesSearchParams } from "@/admin/hooks/useExchangesSearchParams";
import { stockErrorMessage } from "@/admin/utils/stock";

const FILTERS: FilterDefinition[] = [
  {
    key: "status",
    type: "chips",
    label: "Estado",
    options: DOC_STATUS_OPTIONS,
  },
  {
    key: "payment_method",
    type: "select",
    label: "Medio de pago",
    options: PAYMENT_METHOD_OPTIONS,
  },
  {
    key: "sale",
    type: "text",
    label: "Venta (número)",
    placeholder: "Ej. 21",
  },
  { key: "date_from", type: "date", label: "Desde" },
  { key: "date_to", type: "date", label: "Hasta" },
];

/**
 * Pestaña "Cambios" de `SalesPage` (permiso `sales.view_exchange`): una fila
 * por cambio (`GET /exchanges/`). Buscador (cliente, nota o SKU de las
 * líneas; debounce de 300 ms) y `FiltersPopover` con estado, medio de pago,
 * número de venta y rango de fechas. La tabla (`ExchangesTable`, desde `md`)
 * ordena por número, fecha y diferencia; en celulares se muestran tarjetas.
 *
 * Criterios, orden, página y tamaño viven en la URL
 * (`useExchangesSearchParams`) y cualquier cambio vuelve a la página 1. Cubre
 * carga, error (con "Reintentar") y vacío con `StateMessage`. Los cambios se
 * registran desde el detalle de una venta, no desde acá.
 */
export const ExchangesList = () => {
  const { criteria, page, setCriteria, setPage } = useExchangesSearchParams();
  const { search: urlSearch } = criteria;

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
    useExchanges({
      page,
      page_size: criteria.pageSize,
      search: urlSearch,
      ordering: criteria.ordering,
      status: criteria.status,
      payment_method: criteria.paymentMethod,
      sale: criteria.sale ? Number(criteria.sale) : undefined,
      date_from: criteria.dateFrom,
      date_to: criteria.dateTo,
    });

  const hasFilters = !!(
    urlSearch ||
    criteria.status ||
    criteria.paymentMethod ||
    criteria.sale ||
    criteria.dateFrom ||
    criteria.dateTo
  );
  const filterValues: FilterValues = {
    status: criteria.status,
    payment_method: criteria.paymentMethod,
    sale: criteria.sale,
    date_from: criteria.dateFrom,
    date_to: criteria.dateTo,
  };

  const clearFilters = () => {
    setSearch("");
    setCriteria({
      search: "",
      status: "",
      paymentMethod: "",
      sale: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const listProps = {
    exchanges: data?.results ?? [],
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
        placeholder="Buscar por cliente, SKU o nota…"
        actions={
          <>
            <FiltersPopover
              filters={FILTERS}
              value={filterValues}
              onChange={(values) =>
                setCriteria({
                  status: values.status ?? "",
                  paymentMethod: values.payment_method ?? "",
                  sale: values.sale ?? "",
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
            ? "Ningún cambio coincide con los filtros."
            : "Todavía no hay cambios. Se registran desde el detalle de una venta."}
        </StateMessage>
      ) : (
        <>
          <ExchangesTable {...listProps} className="max-md:hidden" />
          <ExchangesCardList {...listProps} className="md:hidden" />
        </>
      )}
      {data ? (
        <Pagination
          page={page}
          pageSize={criteria.pageSize}
          total={data.count}
          itemLabel={{ singular: "cambio", plural: "cambios" }}
          disabled={isPlaceholderData}
          onPageChange={setPage}
          onPageSizeChange={(pageSize) => setCriteria({ pageSize })}
        />
      ) : null}
    </div>
  );
};
