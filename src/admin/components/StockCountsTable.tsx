import { Link } from "react-router";
import { Button } from "@/components/char/button";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { StockCountStatusBadge } from "./StockCountStatusBadge";
import { formatDateTime, stockCountPath } from "../utils/stock";
import type { StockCount } from "../interfaces/stock-count.interface";

/**
 * Tabla de recuentos: número, estado, nota, cantidad de líneas, creado
 * (ordenable por `created_at`), confirmado (ordenable por `confirmed_at`),
 * usuario y "Ver" que abre `StockCountPage`. Es la vista de escritorio: en
 * celulares se muestra `StockCountsCardList`.
 *
 * @param counts Recuentos de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = más nuevos primero).
 * @param onOrderingChange Se llama con el nuevo orden al hacer clic en un encabezado.
 * @param loading Muestra el esqueleto en lugar de las filas.
 * @param dimmed Atenúa las filas mientras se muestra la página anterior.
 * @param className Clases del contenedor (ej. para ocultarla en celulares).
 */
export function StockCountsTable({
  counts,
  ordering,
  onOrderingChange,
  loading,
  dimmed,
  className,
}: {
  counts: StockCount[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  loading?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const columns: DataTableColumn<StockCount>[] = [
    {
      key: "number",
      header: "Recuento",
      cell: (c) => <span className="font-medium">#{c.id}</span>,
    },
    {
      key: "status",
      header: "Estado",
      cell: (c) => <StockCountStatusBadge status={c.status} />,
    },
    {
      key: "note",
      header: "Nota",
      cell: (c) => (
        <span className="text-muted-foreground">{c.note || "–"}</span>
      ),
    },
    {
      key: "items_count",
      header: "Líneas",
      align: "right",
      cell: (c) => <span className="tabular-nums">{c.items_count}</span>,
    },
    {
      key: "created_at",
      header: "Creado",
      sortable: true,
      cell: (c) => (
        <span className="whitespace-nowrap">
          {formatDateTime(c.created_at)}
        </span>
      ),
    },
    {
      key: "confirmed_at",
      header: "Confirmado",
      sortable: true,
      cell: (c) =>
        c.confirmed_at ? (
          <span className="whitespace-nowrap">
            {formatDateTime(c.confirmed_at)}
          </span>
        ) : (
          <span className="text-muted-foreground">–</span>
        ),
    },
    {
      key: "user",
      header: "Usuario",
      cell: (c) => (
        <span className="text-muted-foreground">
          {c.created_by_email?.split("@")[0] ?? "–"}
        </span>
      ),
    },
    {
      key: "detail",
      header: "Detalle",
      hideHeader: true,
      align: "right",
      cell: (c) => (
        <Button
          variant="secondary"
          size="sm"
          render={<Link to={stockCountPath(c.id)} />}
          nativeButton={false}
          aria-label={`Ver el recuento ${c.id}`}
        >
          {c.status === "borrador" ? "Continuar" : "Ver"}
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      caption="Recuentos de stock"
      columns={columns}
      rows={counts}
      getRowKey={(c) => c.id}
      ordering={ordering}
      onOrderingChange={onOrderingChange}
      loading={loading}
      dimmed={dimmed}
      className={className}
    />
  );
}
