import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Repeat } from "lucide-react";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import { Notice } from "@/components/char/notice";
import { PageHeader } from "@/components/char/page-header";
import { Skeleton } from "@/components/char/skeleton";
import { StateMessage } from "@/components/char/state-message";
import { toast } from "@/components/char/sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ExchangeDifference } from "@/admin/components/ExchangeDifference";
import { DocStatusBadge } from "@/admin/components/DocStatusBadge";
import { SaleItemsTable } from "@/admin/components/SaleItemsTable";
import { StockKindBadge } from "@/admin/components/StockKindBadge";
import { VoidDialog } from "@/admin/components/VoidDialog";
import {
  formatSaleMoney,
  PAYMENT_METHOD_LABELS,
  saleClientLabel,
} from "@/admin/config/sales";
import { useBreadcrumbLabel } from "@/admin/hooks/useBreadcrumbLabel";
import { useSale, useVoidSale } from "@/admin/hooks/useSales";
import { useStockOperations } from "@/admin/hooks/useStockOperations";
import type { SaleDetail } from "@/admin/interfaces/sale.interface";
import { getHttpStatus } from "@/admin/utils/productImages";
import { subtractMoney } from "@/admin/utils/money";
import {
  exchangePath,
  formatDeadline,
  newExchangePath,
  todayInBuenosAires,
  unreturnedFromDifference,
} from "@/admin/utils/sales";
import {
  formatDateTime,
  stockErrorMessage,
  stockOperationPath,
} from "@/admin/utils/stock";

const SALES_PATH = "/admin/sales";

/** Panel "Plazo de cambio" / aviso de anulación, según el estado de la venta. */
function ExchangeWindowNotice({ sale }: { sale: SaleDetail }) {
  if (sale.status === "anulada") {
    return (
      <Notice variant="danger" title="Venta anulada">
        {sale.voided_at ? formatDateTime(sale.voided_at) : ""}
        {sale.voided_by_email ? ` por ${sale.voided_by_email}` : ""}. Motivo:{" "}
        {sale.void_reason || "–"}
      </Notice>
    );
  }
  if (sale.can_exchange) {
    return (
      <Notice variant="success" title="Plazo de cambio">
        Se puede cambiar hasta el {formatDeadline(sale.exchange_deadline)}.
      </Notice>
    );
  }
  if (sale.exchange_deadline < todayInBuenosAires()) {
    return (
      <Notice variant="warning" title="Plazo de cambio vencido">
        Venció el {formatDeadline(sale.exchange_deadline)}.
      </Notice>
    );
  }
  return (
    <Notice variant="info" title="Sin unidades para cambiar">
      Todas las unidades de esta venta ya se cambiaron.
    </Notice>
  );
}

/**
 * Detalle de una venta (`/admin/sales/:id`, permiso `sales.view_sale`):
 * encabezado con número y estado, el aviso de plazo de cambio (o el banner de
 * anulación con fecha, usuario y motivo), la ficha (fecha, cliente, vendedor,
 * medio de pago, descuento y nota), los ítems (`SaleItemsTable`), los totales
 * (subtotal, descuento, total cobrado) y, según permisos, los cambios de la
 * venta (`sales.view_exchange`) y sus movimientos de stock
 * (`stock.view_stockmovement`, `GET /stock-operations/?sale=`).
 *
 * "Cambiar" aparece con `sales.add_exchange` **y** `can_exchange` (lo informa
 * el backend). "Anular venta" aparece con `sales.void_sale` y la venta
 * completada: abre `VoidDialog` (motivo obligatorio); si el backend rechaza
 * (por ejemplo, hay cambios activos) muestra su mensaje en el diálogo con
 * enlaces a esos cambios. Cubre carga (esqueleto), error con "Reintentar" y
 * 404. El último tramo de las migas es "Venta #N".
 */
export function SalePage() {
  const { id } = useParams();
  const saleId = /^\d+$/.test(id ?? "") ? Number(id) : null;
  const can = useCan();
  const { data, isPending, isError, error, refetch } = useSale(saleId);
  const { mutate: voidSale, isPending: voiding } = useVoidSale();
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);

  const canViewStock = can(PERMISSIONS.stock.movement.view);
  const { data: stockOps } = useStockOperations({
    sale: saleId ?? undefined,
    page_size: 100,
  });

  useDocumentTitle(data ? `Venta #${data.id} · Char` : "Venta · Char");
  useBreadcrumbLabel(data ? `Venta #${data.id}` : null);

  const back = (
    <Button
      variant="secondary"
      className="w-fit"
      render={<Link to={SALES_PATH} />}
      nativeButton={false}
    >
      <ArrowLeft /> Volver a ventas
    </Button>
  );

  if (saleId === null || (isError && getHttpStatus(error) === 404)) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <StateMessage variant="empty">No encontramos esa venta.</StateMessage>
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
        <span className="sr-only">Cargando venta…</span>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const discountAmount = subtractMoney(data.subtotal, data.total);
  const canExchange = can(PERMISSIONS.sales.exchange.add) && data.can_exchange;
  const canVoid = can(PERMISSIONS.sales.void) && data.status === "completada";
  const activeExchanges = data.exchanges.filter(
    (e) => e.status === "completada",
  );
  const showExchanges = can(PERMISSIONS.sales.exchange.view);

  const closeVoid = () => {
    setVoidOpen(false);
    setVoidError(null);
  };
  const confirmVoid = (reason: string) => {
    voidSale(
      { id: data.id, reason },
      {
        onSuccess: () => {
          closeVoid();
          toast.success(`Venta #${data.id} anulada. El stock volvió.`);
        },
        onError: (err) => setVoidError(stockErrorMessage(err)),
      },
    );
  };

  const info: { label: string; value: React.ReactNode }[] = [
    { label: "Fecha", value: formatDateTime(data.created_at) },
    { label: "Cliente", value: saleClientLabel(data.client_name) },
    { label: "Vendedor", value: data.created_by_email ?? "–" },
    {
      label: "Medio de pago",
      value: PAYMENT_METHOD_LABELS[data.payment_method],
    },
    {
      label: "Descuento",
      value: data.discount_percent
        ? `${data.discount_percent} %${data.discount_reason ? ` · ${data.discount_reason}` : ""}`
        : "–",
    },
    { label: "Nota", value: data.note || "–" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {back}
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            Venta #{data.id}
            <DocStatusBadge status={data.status} />
          </span>
        }
        description={`${data.units} ${data.units === 1 ? "unidad" : "unidades"} · ${formatSaleMoney(data.total)}. Los precios quedaron congelados al vender; una venta no se edita ni se borra.`}
        actions={
          canExchange || canVoid ? (
            <div className="flex flex-wrap gap-3">
              {canExchange ? (
                <Button
                  variant="info"
                  render={<Link to={newExchangePath(data.id)} />}
                  nativeButton={false}
                >
                  <Repeat /> Cambiar
                </Button>
              ) : null}
              {canVoid ? (
                <Button variant="danger" onClick={() => setVoidOpen(true)}>
                  Anular venta
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      />
      <ExchangeWindowNotice sale={data} />
      <dl className="grid gap-4 rounded-card bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
        {info.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {item.label}
            </dt>
            <dd className="text-sm font-medium break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
      <SaleItemsTable items={data.items} />
      <dl className="ml-auto flex w-full max-w-xs flex-col gap-1 text-sm tabular-nums">
        <div className="flex justify-between gap-6">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatSaleMoney(data.subtotal)}</dd>
        </div>
        {data.discount_percent ? (
          <div className="flex justify-between gap-6">
            <dt className="text-muted-foreground">
              Descuento {data.discount_percent} %
            </dt>
            <dd>−{formatSaleMoney(discountAmount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-6 border-t pt-2 text-base font-bold">
          <dt>Total cobrado</dt>
          <dd>{formatSaleMoney(data.total)}</dd>
        </div>
      </dl>
      <div className="grid gap-6 lg:grid-cols-2">
        {showExchanges ? (
          <section className="flex flex-col gap-3 rounded-card bg-card p-4 ring-1 ring-foreground/10">
            <h2 className="text-base font-semibold">Cambios</h2>
            {data.exchanges.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Esta venta no tiene cambios.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.exchanges.map((e) => (
                  <li key={e.id}>
                    <Link
                      to={exchangePath(e.id)}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm text-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <span className="font-medium">Cambio #{e.id}</span>
                      <span className="text-muted-foreground">
                        {formatDateTime(e.created_at)}
                      </span>
                      <DocStatusBadge status={e.status} />
                      <ExchangeDifference
                        difference={e.difference}
                        unreturnedAmount={unreturnedFromDifference(
                          e.difference,
                        )}
                        paymentMethod={e.payment_method}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
        {canViewStock ? (
          <section className="flex flex-col gap-3 rounded-card bg-card p-4 ring-1 ring-foreground/10">
            <h2 className="text-base font-semibold">Movimientos de stock</h2>
            {!stockOps || stockOps.results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {stockOps ? "Sin movimientos." : "Cargando movimientos…"}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {stockOps.results.map((o) => (
                  <li key={o.id}>
                    <Link
                      to={stockOperationPath(o.id)}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm text-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <StockKindBadge kind={o.kind} />
                      <span>{o.reason_display}</span>
                      <span className="text-muted-foreground">
                        {formatDateTime(o.created_at)} · {o.units}{" "}
                        {o.units === 1 ? "unidad" : "unidades"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
      <VoidDialog
        open={voidOpen}
        onOpenChange={(open) => (open ? setVoidOpen(true) : closeVoid())}
        title={`Anular venta #${data.id}`}
        description="Se devolverá el stock de los ítems. Esta acción no se puede deshacer."
        confirmLabel="Anular venta"
        pending={voiding}
        error={voidError}
        errorExtra={
          voidError && activeExchanges.length > 0 ? (
            <span className="mt-2 flex flex-wrap items-center gap-2">
              Cambios activos:
              {activeExchanges.map((e) => (
                <Link
                  key={e.id}
                  to={exchangePath(e.id)}
                  className="underline underline-offset-4"
                >
                  <Badge variant="outline">#{e.id}</Badge>
                </Link>
              ))}
            </span>
          ) : null
        }
        onConfirm={confirmVoid}
      />
    </div>
  );
}
