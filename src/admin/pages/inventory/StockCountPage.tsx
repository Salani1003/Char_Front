import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { Button } from "@/components/char/button";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { PageHeader } from "@/components/char/page-header";
import { Skeleton } from "@/components/char/skeleton";
import { StateMessage } from "@/components/char/state-message";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { StockCountEditor } from "@/admin/components/StockCountEditor";
import { StockCountStatusBadge } from "@/admin/components/StockCountStatusBadge";
import { useBreadcrumbLabel } from "@/admin/hooks/useBreadcrumbLabel";
import { useStockCount } from "@/admin/hooks/useStockCounts";
import type { StockCountItem } from "@/admin/interfaces/stock-count.interface";
import { getHttpStatus } from "@/admin/utils/productImages";
import { formatDateTime, stockErrorMessage } from "@/admin/utils/stock";
import { cn } from "@/lib/utils";

const ITEM_COLUMNS: DataTableColumn<StockCountItem>[] = [
  {
    key: "product",
    header: "Variante",
    cell: (i) => (
      <div className="flex flex-col">
        <span className="font-medium">{i.product_name}</span>
        <span className="text-xs text-muted-foreground">
          <span className="font-mono">{i.sku}</span> · {i.color_name} ·{" "}
          {i.size_name}
        </span>
      </div>
    ),
  },
  {
    key: "system",
    header: "En sistema",
    align: "right",
    cell: (i) => (
      <span className="tabular-nums">{i.system_quantity ?? "–"}</span>
    ),
  },
  {
    key: "counted",
    header: "Contado",
    align: "right",
    cell: (i) => (
      <span className="font-bold tabular-nums">{i.counted_quantity}</span>
    ),
  },
  {
    key: "difference",
    header: "Diferencia",
    align: "right",
    cell: (i) => {
      const d = i.difference;
      return (
        <span
          className={cn(
            "font-bold tabular-nums",
            d !== null && d > 0 && "text-success",
            d !== null && d < 0 && "text-danger",
            (d === null || d === 0) && "font-normal text-muted-foreground",
          )}
        >
          {d === null
            ? "–"
            : d === 0
              ? "sin cambio"
              : `${d > 0 ? "+" : "−"}${Math.abs(d)}`}
        </span>
      );
    },
  },
];

/**
 * Pantalla de un recuento (`/admin/inventory/counts/:id`, permiso
 * `stock.view_stockcount`): encabezado con estado, ficha (creación,
 * confirmación) y, según el estado:
 *
 * - **Borrador:** `StockCountEditor` (editable con `stock.add_stockcount`, si
 *   no, solo lectura). El editor se reinicia (`key`) cuando cambia lo guardado.
 * - **Confirmado / cancelado:** congelado; tabla de líneas con lo contado, el
 *   saldo del sistema al confirmar y la diferencia. Es la **única** pantalla de
 *   un recuento: el historial y la operación de ajuste que generó llevan acá
 *   (no hay que abrir la operación aparte).
 *
 * Cubre carga (esqueleto), error con "Reintentar" y 404 ("No encontramos ese
 * recuento"; el texto del backend viene en inglés). La última miga es "Recuento #N".
 */
export function StockCountPage() {
  const { id } = useParams();
  const countId = /^\d+$/.test(id ?? "") ? Number(id) : null;
  const can = useCan();
  const { data, isPending, isError, error, refetch } = useStockCount(countId);
  useDocumentTitle(data ? `Recuento #${data.id} · Char` : "Recuento · Char");
  useBreadcrumbLabel(data ? `Recuento #${data.id}` : null);

  const back = (
    <Button
      variant="secondary"
      className="w-fit"
      render={<Link to="/admin/inventory?view=counts" />}
      nativeButton={false}
    >
      <ArrowLeft /> Volver a recuentos
    </Button>
  );

  if (countId === null || (isError && getHttpStatus(error) === 404)) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <StateMessage variant="empty">
          No encontramos ese recuento.
        </StateMessage>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        {back}
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
      </div>
    );
  }
  if (isPending) {
    return (
      <div role="status" className="flex flex-col gap-6">
        <span className="sr-only">Cargando recuento…</span>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const info: { label: string; value: string }[] = [
    { label: "Creado", value: formatDateTime(data.created_at) },
    { label: "Creado por", value: data.created_by_email ?? "–" },
    ...(data.confirmed_at
      ? [
          { label: "Confirmado", value: formatDateTime(data.confirmed_at) },
          { label: "Confirmado por", value: data.confirmed_by_email ?? "–" },
        ]
      : []),
  ];
  const changed = data.items.filter((i) => i.difference).length;
  // Reinicia el editor cuando cambia lo que está guardado en el servidor.
  const editorKey = `${data.note}|${data.items.map((i) => `${i.variant}:${i.counted_quantity}`).join(",")}`;

  return (
    <div className="flex flex-col gap-6">
      {back}
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            Recuento #{data.id}
            <StockCountStatusBadge status={data.status} />
          </span>
        }
        description={
          data.status === "borrador"
            ? "Contá el stock físico y compará con el sistema. Un borrador no cambia el stock hasta que lo confirmes; las variantes que no cargues no se tocan."
            : data.status === "confirmado"
              ? `Recuento confirmado: ${changed} de ${data.items.length} ${data.items.length === 1 ? "variante tuvo" : "variantes tuvieron"} diferencia y se ${changed === 1 ? "ajustó" : "ajustaron"} en el stock. Ya no se puede modificar.`
              : "Recuento cancelado: no tocó el stock y ya no se puede modificar."
        }
      />
      <dl className="grid gap-4 rounded-card bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
        {info.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {item.label}
            </dt>
            <dd className="text-sm font-medium break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
      {data.status === "borrador" ? (
        <StockCountEditor
          key={editorKey}
          count={data}
          canEdit={can(PERMISSIONS.stock.count.add)}
        />
      ) : (
        <>
          {data.note ? (
            <p className="text-sm text-muted-foreground">Nota: {data.note}</p>
          ) : null}
          {data.items.length === 0 ? (
            <StateMessage variant="empty">
              Este recuento no tiene líneas.
            </StateMessage>
          ) : (
            <DataTable
              caption="Líneas del recuento"
              columns={ITEM_COLUMNS}
              rows={data.items}
              getRowKey={(i) => i.id}
            />
          )}
        </>
      )}
    </div>
  );
}
