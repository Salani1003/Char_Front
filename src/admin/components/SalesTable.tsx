import { Link } from "react-router";
import { Button } from "@/components/char/button";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { cn } from "@/lib/utils";
import { DocStatusBadge } from "./DocStatusBadge";
import { formatSaleMoney, saleClientLabel } from "../config/sales";
import type { Sale } from "../interfaces/sale.interface";
import { formatDateTime } from "../utils/stock";
import { salePath } from "../utils/sales";

/** Una venta anulada se muestra atenuada. */
const dimmed = (sale: Sale) => sale.status === "anulada";

/**
 * Tabla del listado de ventas: número, fecha, cliente (sin cliente =
 * "Consumidor final"), unidades (y variantes), medio de pago, descuento
 * ("–" si no hay), total (tachado si la venta se anuló) y estado, más un
 * "Ver detalle". Ordena por fecha, total y número. Las ventas anuladas se
 * atenúan. Es la vista de escritorio: en celulares se muestra `SalesCardList`.
 *
 * @param sales Ventas de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = más nuevas primero).
 * @param onOrderingChange Se llama con el nuevo orden al hacer clic en un encabezado.
 * @param loading Muestra el esqueleto en lugar de las filas.
 * @param dimmed Atenúa las filas mientras se muestra la página anterior.
 * @param className Clases del contenedor (ej. para ocultarla en celulares).
 */
export function SalesTable({
  sales,
  ordering,
  onOrderingChange,
  loading,
  dimmed: stale,
  className,
}: {
  sales: Sale[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  loading?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const muted = (sale: Sale) => (dimmed(sale) ? "text-muted-foreground" : "");
  const columns: DataTableColumn<Sale>[] = [
    {
      key: "id",
      header: "N°",
      sortable: true,
      cell: (s) => (
        <span className={cn("font-medium tabular-nums", muted(s))}>
          #{s.id}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Fecha",
      sortable: true,
      cell: (s) => (
        <span className={cn("whitespace-nowrap", muted(s))}>
          {formatDateTime(s.created_at)}
        </span>
      ),
    },
    {
      key: "client",
      header: "Cliente",
      cell: (s) => (
        <span className={muted(s)}>{saleClientLabel(s.client_name)}</span>
      ),
    },
    {
      key: "units",
      header: "Unidades",
      align: "right",
      cell: (s) => (
        <span className={cn("tabular-nums", muted(s))}>
          {s.units}
          {s.items_count > 1 ? (
            <span className="text-muted-foreground">
              {" "}
              ({s.items_count} var.)
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "payment_method",
      header: "Medio de pago",
      cell: (s) => <span className={muted(s)}>{s.payment_method_display}</span>,
    },
    {
      key: "discount",
      header: "Desc.",
      align: "right",
      cell: (s) => (
        <span className={cn("tabular-nums", muted(s))}>
          {s.discount_percent ? `${s.discount_percent} %` : "–"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      align: "right",
      cell: (s) => (
        <span
          className={cn(
            "font-medium whitespace-nowrap tabular-nums",
            s.status === "anulada" && "text-muted-foreground line-through",
          )}
        >
          {formatSaleMoney(s.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (s) => <DocStatusBadge status={s.status} />,
    },
    {
      key: "detail",
      header: "Detalle",
      hideHeader: true,
      align: "right",
      cell: (s) => (
        <Button
          variant="secondary"
          size="sm"
          render={<Link to={salePath(s.id)} />}
          nativeButton={false}
          aria-label={`Ver detalle de la venta ${s.id}`}
        >
          Ver detalle
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      caption="Listado de ventas"
      columns={columns}
      rows={sales}
      getRowKey={(s) => s.id}
      ordering={ordering}
      onOrderingChange={onOrderingChange}
      loading={loading}
      dimmed={stale}
      className={className}
    />
  );
}
