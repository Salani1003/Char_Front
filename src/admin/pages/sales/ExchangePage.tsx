import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { Button } from "@/components/char/button";
import { Notice } from "@/components/char/notice";
import { PageHeader } from "@/components/char/page-header";
import { Skeleton } from "@/components/char/skeleton";
import { StateMessage } from "@/components/char/state-message";
import { toast } from "@/components/char/sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { DocStatusBadge } from "@/admin/components/DocStatusBadge";
import { ExchangeBalance } from "@/admin/components/ExchangeBalance";
import { ExchangeItemsTable } from "@/admin/components/ExchangeItemsTable";
import { StockKindBadge } from "@/admin/components/StockKindBadge";
import { VoidDialog } from "@/admin/components/VoidDialog";
import { formatSaleMoney, saleClientLabel } from "@/admin/config/sales";
import { useBreadcrumbLabel } from "@/admin/hooks/useBreadcrumbLabel";
import { useExchange, useVoidExchange } from "@/admin/hooks/useExchanges";
import { useStockOperations } from "@/admin/hooks/useStockOperations";
import { getHttpStatus } from "@/admin/utils/productImages";
import { salePath } from "@/admin/utils/sales";
import {
  formatDateTime,
  stockErrorMessage,
  stockOperationPath,
} from "@/admin/utils/stock";

const EXCHANGES_PATH = "/admin/sales?view=exchanges";

/**
 * Detalle de un cambio (`/admin/sales/exchanges/:id`, permiso
 * `sales.view_exchange`): encabezado con número y estado, enlace a la venta de
 * origen, ficha (fecha, cliente, vendedor, nota), las dos tablas ("Devuelve" a
 * lo que pagó, "Se lleva" al precio vigente de hoy), el balance
 * (`ExchangeBalance`, con el medio de pago de la diferencia) y, con
 * `stock.view_stockmovement`, los movimientos de stock (`?exchange=`). Si lo
 * que se lleva vale menos, un aviso informa que no se devolvió dinero.
 *
 * Un cambio anulado muestra un banner con fecha, usuario y motivo y no tiene
 * acciones. "Anular cambio" aparece con `sales.void_exchange` y el cambio
 * completado: abre `VoidDialog` (motivo obligatorio); si el backend rechaza
 * (la prenda devuelta ya se vendió) muestra su mensaje tal cual. Cubre carga
 * (esqueleto), error con "Reintentar" y 404. El último tramo de las migas es
 * "Cambio #N".
 */
export function ExchangePage() {
  const { id } = useParams();
  const exchangeId = /^\d+$/.test(id ?? "") ? Number(id) : null;
  const can = useCan();
  const { data, isPending, isError, error, refetch } = useExchange(exchangeId);
  const { mutate: voidExchange, isPending: voiding } = useVoidExchange();
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);

  const canViewStock = can(PERMISSIONS.stock.movement.view);
  const { data: stockOps } = useStockOperations({
    exchange: exchangeId ?? undefined,
    page_size: 100,
  });

  useDocumentTitle(data ? `Cambio #${data.id} · Char` : "Cambio · Char");
  useBreadcrumbLabel(data ? `Cambio #${data.id}` : null);

  const back = (
    <Button
      variant="secondary"
      className="w-fit"
      render={<Link to={EXCHANGES_PATH} />}
      nativeButton={false}
    >
      <ArrowLeft /> Volver a cambios
    </Button>
  );

  if (exchangeId === null || (isError && getHttpStatus(error) === 404)) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <StateMessage variant="empty">No encontramos ese cambio.</StateMessage>
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
        <span className="sr-only">Cargando cambio…</span>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const returned = data.items.filter((item) => item.direction === "in");
  const taken = data.items.filter((item) => item.direction === "out");
  const canVoid =
    can(PERMISSIONS.sales.exchange.void) && data.status === "completada";
  const unreturned = !data.unreturned_amount.match(/^0+(\.0+)?$/);

  const closeVoid = () => {
    setVoidOpen(false);
    setVoidError(null);
  };
  const confirmVoid = (reason: string) => {
    voidExchange(
      { id: data.id, reason },
      {
        onSuccess: () => {
          closeVoid();
          toast.success(`Cambio #${data.id} anulado.`);
        },
        onError: (err) => setVoidError(stockErrorMessage(err)),
      },
    );
  };

  const info: { label: string; value: React.ReactNode }[] = [
    {
      label: "Venta",
      value: (
        <Link
          to={salePath(data.sale)}
          className="rounded-sm underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Ver venta #{data.sale}
        </Link>
      ),
    },
    { label: "Fecha", value: formatDateTime(data.created_at) },
    { label: "Cliente", value: saleClientLabel(data.client_name) },
    { label: "Vendedor", value: data.created_by_email ?? "–" },
    { label: "Nota", value: data.note || "–" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {back}
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            Cambio #{data.id}
            <DocStatusBadge status={data.status} />
          </span>
        }
        description="Un cambio no se edita ni se borra. Lo que se devuelve vale lo que el cliente pagó; lo que se lleva, el precio vigente al cambiar."
        actions={
          canVoid ? (
            <Button variant="danger" onClick={() => setVoidOpen(true)}>
              Anular cambio
            </Button>
          ) : undefined
        }
      />
      {data.status === "anulada" ? (
        <Notice variant="danger" title="Cambio anulado">
          {data.voided_at ? formatDateTime(data.voided_at) : ""}
          {data.voided_by_email ? ` por ${data.voided_by_email}` : ""}. Motivo:{" "}
          {data.void_reason || "–"}
        </Notice>
      ) : null}
      <dl className="grid gap-4 rounded-card bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-5">
        {info.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {item.label}
            </dt>
            <dd className="text-sm font-medium break-words">{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Devuelve</h2>
          <ExchangeItemsTable
            items={returned}
            caption="Prendas que devuelve el cliente"
          />
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Se lleva</h2>
          {taken.length === 0 ? (
            <StateMessage variant="empty">
              El cliente no se llevó nada.
            </StateMessage>
          ) : (
            <ExchangeItemsTable
              items={taken}
              caption="Prendas que se lleva el cliente"
            />
          )}
        </section>
      </div>
      <section className="flex flex-col gap-4 rounded-card bg-card p-4 ring-1 ring-foreground/10">
        <ExchangeBalance
          returnedTotal={data.returned_total}
          newTotal={data.new_total}
          difference={data.difference}
          unreturnedAmount={data.unreturned_amount}
          paymentMethod={data.payment_method}
        />
        {unreturned ? (
          <Notice variant="info" title="Sin devolución de dinero">
            Lo que se llevó valió {formatSaleMoney(data.unreturned_amount)}{" "}
            menos que lo devuelto y esa diferencia no se reintegró.
          </Notice>
        ) : null}
      </section>
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
      <VoidDialog
        open={voidOpen}
        onOpenChange={(open) => (open ? setVoidOpen(true) : closeVoid())}
        title={`Anular cambio #${data.id}`}
        description="Vuelve a entrar al stock lo que se llevó y sale lo que se había devuelto. Las unidades quedan disponibles para cambiar de nuevo."
        confirmLabel="Anular cambio"
        pending={voiding}
        error={voidError}
        onConfirm={confirmVoid}
      />
    </div>
  );
}
