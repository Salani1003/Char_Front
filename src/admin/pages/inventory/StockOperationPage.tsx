import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Can } from "@/auth/components/Can";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import { PageHeader } from "@/components/char/page-header";
import { Skeleton } from "@/components/char/skeleton";
import { StateMessage } from "@/components/char/state-message";
import { toast } from "@/components/char/sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { StockKindBadge } from "@/admin/components/StockKindBadge";
import { StockMovementsTable } from "@/admin/components/StockMovementsTable";
import { useBreadcrumbLabel } from "@/admin/hooks/useBreadcrumbLabel";
import {
  useReverseStockMovement,
  useStockOperation,
} from "@/admin/hooks/useStockOperations";
import type { StockMovement } from "@/admin/interfaces/stock-operation.interface";
import {
  formatDateTime,
  stockCountPath,
  stockErrorMessage,
  stockOperationPath,
} from "@/admin/utils/stock";
import { getHttpStatus } from "@/admin/utils/productImages";

/**
 * Detalle de una operación de stock (`/admin/inventory/operations/:id`,
 * permiso `stock.view_stockmovement`): encabezado con tipo y motivo, ficha
 * (fecha, usuario, motivo, nota, recuento de origen) y la tabla de líneas
 * (`StockMovementsTable`, todas, sin paginar). Cubre carga (esqueleto), error
 * con "Reintentar" y 404 ("No encontramos esa operación", con enlace al
 * historial; el texto del backend viene en inglés y no se muestra).
 *
 * "Anular línea" aparece con `stock.add_stockmovement` solo si la operación no
 * es un ajuste ni la generó una venta o un cambio (`sale`/`exchange`: esas se
 * anulan desde Ventas), la línea no es ya una anulación y no está anulada. Pide
 * confirmación (`AlertDialog`); si el backend rechaza la anulación (ya
 * anulada, o ya no alcanza el saldo) muestra su mensaje dentro del mismo
 * diálogo. Al anular bien, el aviso ofrece "Ver anulación" (la anulación es
 * una operación nueva de una línea). El último tramo de las migas es
 * "Ingreso #N".
 *
 * Las operaciones que generó un recuento no se muestran acá: con
 * `stock.view_stockcount` redirigen a `StockCountPage`.
 */
export function StockOperationPage() {
  const { id } = useParams();
  const operationId = /^\d+$/.test(id ?? "") ? Number(id) : null;
  const navigate = useNavigate();
  const can = useCan();
  const { data, isPending, isError, error, refetch } =
    useStockOperation(operationId);
  const { mutate: reverse, isPending: reversing } = useReverseStockMovement();
  const [toReverse, setToReverse] = useState<StockMovement | null>(null);
  const [reverseError, setReverseError] = useState<string | null>(null);

  useDocumentTitle(
    data ? `${data.kind_display} #${data.id} · Char` : "Operación · Char",
  );
  useBreadcrumbLabel(data ? `${data.kind_display} #${data.id}` : null);

  const closeReverse = () => {
    setToReverse(null);
    setReverseError(null);
  };

  const confirmReverse = () => {
    if (!toReverse) return;
    reverse(toReverse.id, {
      onSuccess: (reversal) => {
        closeReverse();
        toast.success("Línea anulada", {
          action: {
            label: "Ver anulación",
            onClick: () =>
              void navigate(stockOperationPath(reversal.operation)),
          },
        });
      },
      onError: (err) => setReverseError(stockErrorMessage(err)),
    });
  };

  const back = (
    <Button
      variant="secondary"
      className="w-fit"
      render={<Link to="/admin/inventory?view=history" />}
      nativeButton={false}
    >
      <ArrowLeft /> Volver al historial
    </Button>
  );

  if (operationId === null || (isError && getHttpStatus(error) === 404)) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <StateMessage variant="empty">
          No encontramos esa operación.
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
        <span className="sr-only">Cargando operación…</span>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Un ajuste de recuento se ve en la pantalla del recuento (una sola pantalla).
  if (data.stock_count !== null && can(PERMISSIONS.stock.count.view)) {
    return <Navigate to={stockCountPath(data.stock_count)} replace />;
  }

  const canReverse = (movement: StockMovement) =>
    can(PERMISSIONS.stock.movement.add) &&
    data.kind !== "ajuste" &&
    // Las líneas de una venta o de un cambio se anulan desde la venta/cambio.
    data.sale === null &&
    data.exchange === null &&
    movement.reason !== "anulacion" &&
    movement.reversed_by === null;

  const info: { label: string; value: React.ReactNode }[] = [
    { label: "Fecha", value: formatDateTime(data.created_at) },
    { label: "Usuario", value: data.created_by_email ?? "–" },
    { label: "Motivo", value: data.reason_display },
    { label: "Nota", value: data.note || "–" },
    ...(data.stock_count !== null
      ? [
          {
            label: "Recuento",
            value: can(PERMISSIONS.stock.count.view) ? (
              <Link
                to={stockCountPath(data.stock_count)}
                className="rounded-sm underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Ver recuento #{data.stock_count}
              </Link>
            ) : (
              `#${data.stock_count}`
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      {back}
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {data.kind_display} #{data.id}
            <StockKindBadge kind={data.kind} />
            <Badge variant="outline">{data.reason_display}</Badge>
          </span>
        }
        description={`${data.lines_count} ${data.lines_count === 1 ? "variante" : "variantes"} · ${data.units} ${data.units === 1 ? "unidad" : "unidades"}. Las líneas de una operación se registraron juntas y no se editan.`}
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
      {data.movements.length === 0 ? (
        <StateMessage variant="empty">
          Se contó y no hubo diferencias: esta operación no movió stock.
        </StateMessage>
      ) : (
        <StockMovementsTable
          movements={data.movements}
          canReverse={canReverse}
          onReverse={setToReverse}
        />
      )}
      <Can permission={PERMISSIONS.stock.movement.add}>
        <p className="text-xs text-muted-foreground">
          Anular una línea crea una operación de anulación aparte. No se anulan
          ajustes ni anulaciones, ni una línea ya anulada.
        </p>
      </Can>
      <AlertDialog
        open={toReverse !== null}
        onOpenChange={(open) => !open && !reversing && closeReverse()}
        variant={reverseError ? "danger" : "warning"}
        title={
          reverseError ? "No se pudo anular la línea" : "¿Anular esta línea?"
        }
        description={
          reverseError ??
          (toReverse
            ? `Se revertirá ${toReverse.quantity > 0 ? "+" : "−"}${Math.abs(toReverse.quantity)} de ${toReverse.sku} (${toReverse.product_name}, ${toReverse.color_name}, ${toReverse.size_name}). Queda registrado como una operación nueva.`
            : undefined)
        }
        confirmLabel={reverseError ? "Cerrar" : "Anular línea"}
        cancelLabel={reverseError ? undefined : "Cancelar"}
        closeOnConfirm={false}
        confirmDisabled={reversing}
        onConfirm={reverseError ? closeReverse : confirmReverse}
      />
    </div>
  );
}
