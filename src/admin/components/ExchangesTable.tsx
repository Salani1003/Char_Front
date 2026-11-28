import { Link } from "react-router";
import { Button } from "@/components/char/button";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { cn } from "@/lib/utils";
import { DocStatusBadge } from "./DocStatusBadge";
import { ExchangeDifference } from "./ExchangeDifference";
import { formatSaleMoney } from "../config/sales";
import type { Exchange } from "../interfaces/exchange.interface";
import { exchangePath, salePath } from "../utils/sales";
import { formatDateTime } from "../utils/stock";

/** Un cambio anulado se muestra atenuado. */
const muted = (exchange: Exchange) =>
  exchange.status === "anulada" ? "text-muted-foreground" : "";

/**
 * Tabla del listado de cambios: número, fecha, venta de origen (enlace),
 * cliente, lo que devuelve, lo que se lleva, la diferencia (`ExchangeDifference`)
 * y el estado, más un "Ver detalle". Ordena por número, fecha y diferencia.
 * Es la vista de escritorio: en celulares se muestra `ExchangesCardList`.
 *
 * @param exchanges Cambios de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = más nuevos primero).
 * @param onOrderingChange Se llama con el nuevo orden al hacer clic en un encabezado.
 * @param loading Muestra el esqueleto en lugar de las filas.
 * @param dimmed Atenúa las filas mientras se muestra la página anterior.
 * @param className Clases del contenedor (ej. para ocultarla en celulares).
 */
export function ExchangesTable({
  exchanges,
  ordering,
  onOrderingChange,
  loading,
  dimmed,
  className,
}: {
  exchanges: Exchange[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  loading?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const columns: DataTableColumn<Exchange>[] = [
    {
      key: "id",
      header: "N°",
      sortable: true,
      cell: (x) => (
        <span className={cn("font-medium tabular-nums", muted(x))}>
          #{x.id}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Fecha",
      sortable: true,
      cell: (x) => (
        <span className={cn("whitespace-nowrap", muted(x))}>
          {formatDateTime(x.created_at)}
        </span>
      ),
    },
    {
      key: "sale",
      header: "Venta",
      cell: (x) => (
        <Link
          to={salePath(x.sale)}
          className="rounded-sm tabular-nums underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          #{x.sale}
        </Link>
      ),
    },
    {
      key: "client",
      header: "Cliente",
      cell: (x) => (
        <span className={muted(x)}>{x.client_name ?? "Consumidor final"}</span>
      ),
    },
    {
      key: "returned",
      header: "Devuelve",
      align: "right",
      cell: (x) => (
        <span className={cn("whitespace-nowrap tabular-nums", muted(x))}>
          {formatSaleMoney(x.returned_total)}
        </span>
      ),
    },
    {
      key: "new",
      header: "Se lleva",
      align: "right",
      cell: (x) => (
        <span className={cn("whitespace-nowrap tabular-nums", muted(x))}>
          {formatSaleMoney(x.new_total)}
        </span>
      ),
    },
    {
      key: "difference",
      header: "Diferencia",
      sortable: true,
      align: "right",
      cell: (x) => (
        <ExchangeDifference
          className={muted(x)}
          difference={x.difference}
          unreturnedAmount={x.unreturned_amount}
          paymentMethod={x.payment_method}
        />
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (x) => <DocStatusBadge status={x.status} />,
    },
    {
      key: "detail",
      header: "Detalle",
      hideHeader: true,
      align: "right",
      cell: (x) => (
        <Button
          variant="secondary"
          size="sm"
          render={<Link to={exchangePath(x.id)} />}
          nativeButton={false}
          aria-label={`Ver detalle del cambio ${x.id}`}
        >
          Ver detalle
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      caption="Listado de cambios"
      columns={columns}
      rows={exchanges}
      getRowKey={(x) => x.id}
      ordering={ordering}
      onOrderingChange={onOrderingChange}
      loading={loading}
      dimmed={dimmed}
      className={className}
    />
  );
}
