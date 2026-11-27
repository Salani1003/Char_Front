import { Link } from "react-router";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { StockKindBadge } from "./StockKindBadge";
import {
  formatDateTime,
  operationUser,
  operationDetailPath,
} from "../utils/stock";
import type { StockOperation } from "../interfaces/stock-operation.interface";

/**
 * Tabla del historial de stock: una fila por **operación** (fecha, tipo,
 * motivo —con "Recuento #N" si lo originó un recuento—, variantes, unidades,
 * nota y usuario) y un "Ver detalle" que abre `StockOperationPage` (o `StockCountPage` si la operación la generó un recuento y se puede verlo). Ordena por
 * `created_at`, `lines_count` y `units`. Es la vista de escritorio: en
 * celulares se muestra `StockOperationsCardList`.
 *
 * @param operations Operaciones de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = más nuevas primero).
 * @param onOrderingChange Se llama con el nuevo orden al hacer clic en un encabezado.
 * @param loading Muestra el esqueleto en lugar de las filas.
 * @param dimmed Atenúa las filas mientras se muestra la página anterior.
 * @param className Clases del contenedor (ej. para ocultarla en celulares).
 */
export function StockOperationsTable({
  operations,
  ordering,
  onOrderingChange,
  loading,
  dimmed,
  className,
}: {
  operations: StockOperation[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  loading?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const canViewCounts = useCan()(PERMISSIONS.stock.count.view);
  const columns: DataTableColumn<StockOperation>[] = [
    {
      key: "created_at",
      header: "Fecha",
      sortable: true,
      cell: (o) => (
        <span className="whitespace-nowrap">
          {formatDateTime(o.created_at)}
        </span>
      ),
    },
    {
      key: "kind",
      header: "Tipo",
      cell: (o) => <StockKindBadge kind={o.kind} />,
    },
    {
      key: "reason",
      header: "Motivo",
      cell: (o) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          {o.reason_display}
          {o.stock_count !== null ? (
            <Badge variant="outline">Recuento #{o.stock_count}</Badge>
          ) : null}
        </span>
      ),
    },
    {
      key: "lines_count",
      header: "Variantes",
      sortable: true,
      align: "right",
      cell: (o) => <span className="tabular-nums">{o.lines_count}</span>,
    },
    {
      key: "units",
      header: "Unidades",
      sortable: true,
      align: "right",
      cell: (o) => <span className="tabular-nums">{o.units}</span>,
    },
    {
      key: "note",
      header: "Nota",
      cell: (o) => (
        <span className="text-muted-foreground">{o.note || "–"}</span>
      ),
    },
    {
      key: "user",
      header: "Usuario",
      cell: (o) => (
        <span className="text-muted-foreground">{operationUser(o)}</span>
      ),
    },
    {
      key: "detail",
      header: "Detalle",
      hideHeader: true,
      align: "right",
      cell: (o) => (
        <Button
          variant="secondary"
          size="sm"
          render={<Link to={operationDetailPath(o, canViewCounts)} />}
          nativeButton={false}
          aria-label={`Ver detalle de la operación ${o.id}`}
        >
          Ver detalle
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      caption="Historial de operaciones de stock"
      columns={columns}
      rows={operations}
      getRowKey={(o) => o.id}
      ordering={ordering}
      onOrderingChange={onOrderingChange}
      loading={loading}
      dimmed={dimmed}
      className={className}
    />
  );
}
