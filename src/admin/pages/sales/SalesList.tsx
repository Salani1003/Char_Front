import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/char/button";
import { FiltersPopover } from "@/components/char/filters-popover";
import type {
  FilterDefinition,
  FilterValues,
} from "@/components/char/filters-popover";
import { Pagination } from "@/components/char/pagination";
import { SearchBar } from "@/components/char/search-bar";
import { StateMessage } from "@/components/char/state-message";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { useDebounce } from "@/hooks/useDebounce";
import { SalesCardList } from "@/admin/components/SalesCardList";
import { SalesTable } from "@/admin/components/SalesTable";
import {
  DOC_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from "@/admin/config/sales";
import { useSales } from "@/admin/hooks/useSales";
import { useSalesSearchParams } from "@/admin/hooks/useSalesSearchParams";
import { NEW_SALE_PATH } from "@/admin/utils/sales";
import { stockErrorMessage } from "@/admin/utils/stock";

const YES_NO = [
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

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
  { key: "date_from", type: "date", label: "Desde" },
  { key: "date_to", type: "date", label: "Hasta" },
  {
    key: "has_discount",
    type: "chips",
    label: "Con descuento",
    options: YES_NO,
  },
  {
    key: "has_exchanges",
    type: "chips",
    label: "Con cambios",
    options: YES_NO,
  },
  {
    key: "min_total",
    type: "text",
    label: "Total mínimo",
    placeholder: "Ej. 10000",
  },
  {
    key: "max_total",
    type: "text",
    label: "Total máximo",
    placeholder: "Ej. 50000",
  },
];

/**
 * Pestaña "Ventas" de `SalesPage` (permiso `sales.view_sale`): una fila por
 * venta (`GET /sales/`). Buscador (cliente, nota o SKU; debounce de 300 ms) y
 * `FiltersPopover` con estado, medio de pago, rango de fechas (día de Buenos
 * Aires, inclusivo), con descuento, con cambios y total mínimo/máximo. La
 * tabla (`SalesTable`, desde `md`) ordena por número, fecha y total; en
 * celulares se muestran tarjetas.
 *
 * Criterios, orden, página y tamaño viven en la URL (`useSalesSearchParams`) y
 * cualquier cambio vuelve a la página 1. Cubre carga, error (con "Reintentar")
 * y vacío con `StateMessage` (sin ventas todavía: invita a registrar la
 * primera con `sales.add_sale`; con filtros: ofrece limpiarlos).
 */
export const SalesList = () => {
  const can = useCan();
  const { criteria, page, setCriteria, setPage } = useSalesSearchParams();
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
    useSales({
      page,
      page_size: criteria.pageSize,
      search: urlSearch,
      ordering: criteria.ordering,
      status: criteria.status,
      payment_method: criteria.paymentMethod,
      date_from: criteria.dateFrom,
      date_to: criteria.dateTo,
      has_discount: criteria.hasDiscount,
      has_exchanges: criteria.hasExchanges,
      min_total: criteria.minTotal,
      max_total: criteria.maxTotal,
    });

  const hasFilters = !!(
    urlSearch ||
    criteria.status ||
    criteria.paymentMethod ||
    criteria.dateFrom ||
    criteria.dateTo ||
    criteria.hasDiscount ||
    criteria.hasExchanges ||
    criteria.minTotal ||
    criteria.maxTotal
  );
  const filterValues: FilterValues = {
    status: criteria.status,
    payment_method: criteria.paymentMethod,
    date_from: criteria.dateFrom,
    date_to: criteria.dateTo,
    has_discount: criteria.hasDiscount,
    has_exchanges: criteria.hasExchanges,
    min_total: criteria.minTotal,
    max_total: criteria.maxTotal,
  };

  const clearFilters = () => {
    setSearch("");
    setCriteria({
      search: "",
      status: "",
      paymentMethod: "",
      dateFrom: "",
      dateTo: "",
      hasDiscount: "",
      hasExchanges: "",
      minTotal: "",
      maxTotal: "",
    });
  };

  const listProps = {
    sales: data?.results ?? [],
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
                  dateFrom: values.date_from ?? "",
                  dateTo: values.date_to ?? "",
                  hasDiscount: values.has_discount ?? "",
                  hasExchanges: values.has_exchanges ?? "",
                  minTotal: values.min_total ?? "",
                  maxTotal: values.max_total ?? "",
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
            ) : can(PERMISSIONS.sales.add) ? (
              <Button
                variant="info"
                render={<Link to={NEW_SALE_PATH} />}
                nativeButton={false}
              >
                Registrar la primera venta
              </Button>
            ) : undefined
          }
        >
          {hasFilters
            ? "Ninguna venta coincide con los filtros."
            : "Todavía no hay ventas."}
        </StateMessage>
      ) : (
        <>
          <SalesTable {...listProps} className="max-md:hidden" />
          <SalesCardList {...listProps} className="md:hidden" />
        </>
      )}
      {data ? (
        <Pagination
          page={page}
          pageSize={criteria.pageSize}
          total={data.count}
          itemLabel={{ singular: "venta", plural: "ventas" }}
          disabled={isPlaceholderData}
          onPageChange={setPage}
          onPageSizeChange={(pageSize) => setCriteria({ pageSize })}
        />
      ) : null}
    </div>
  );
};
