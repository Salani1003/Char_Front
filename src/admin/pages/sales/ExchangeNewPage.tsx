import { useEffect, useState } from "react";
import { Link, useBlocker, useNavigate, useParams } from "react-router";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { Card } from "@/components/char/card";
import { Checkbox } from "@/components/char/checkbox";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { Notice } from "@/components/char/notice";
import { PageHeader } from "@/components/char/page-header";
import { Skeleton } from "@/components/char/skeleton";
import { StateMessage } from "@/components/char/state-message";
import { toast } from "@/components/char/sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ExchangeBalance } from "@/admin/components/ExchangeBalance";
import { PaymentMethodSelect } from "@/admin/components/PaymentMethodSelect";
import { SaleCartLine } from "@/admin/components/SaleCartLine";
import { VariantColor } from "@/admin/components/VariantColor";
import { VariantPicker } from "@/admin/components/VariantPicker";
import {
  formatSaleMoney,
  SALE_NOTE_MAX_LENGTH,
  saleClientLabel,
  type PaymentMethod,
} from "@/admin/config/sales";
import { useBreadcrumbLabel } from "@/admin/hooks/useBreadcrumbLabel";
import {
  useCreateExchange,
  useExchangePreview,
} from "@/admin/hooks/useExchanges";
import { useSale } from "@/admin/hooks/useSales";
import {
  buildExchangeRequest,
  differenceSign,
  returnedVariantIds,
  setReturnedQuantity,
  type ReturnedQuantities,
} from "@/admin/utils/exchangeDraft";
import { getHttpStatus } from "@/admin/utils/productImages";
import {
  addBlockedReason,
  addToCart,
  applyShortage,
  parseStockShortage,
  removeLine,
  setLineQuantity,
  type CartLine,
} from "@/admin/utils/saleCart";
import {
  exchangePath,
  formatDeadline,
  salePath,
  todayInBuenosAires,
} from "@/admin/utils/sales";
import { stockErrorMessage } from "@/admin/utils/stock";

/**
 * Nuevo cambio de una venta (`/admin/sales/:id/exchange/new`, permiso
 * `sales.add_exchange`). Dos columnas y un balance:
 *
 * 1. **Devuelve:** los ítems de la venta (`GET /sales/:id/`), cada uno con su
 *    casilla y su cantidad, acotada a `exchangeable_quantity`; los que ya no
 *    tienen unidades quedan deshabilitados.
 * 2. **Se lleva:** el `VariantPicker` de la venta y los ítems elegidos. Las
 *    variantes que se están devolviendo no se pueden llevar (el backend no
 *    cambia una variante por sí misma). Llevarse nada es válido.
 *
 * **Toda cifra del balance sale de la vista previa** (`POST
 * /exchanges/preview/`, con debounce de 300 ms, indicador de carga y sus
 * mismos 400: plazo, cantidades, sin stock, que se muestran en el balance y
 * marcan la línea). Estados según `difference`: `> 0` pide el medio de pago
 * (obligatorio); `= 0` no pide nada; `< 0` avisa que no se devuelve dinero y se
 * puede confirmar igual. Sin nada devuelto el balance queda vacío y
 * "Confirmar" deshabilitado. Un 400 de stock al confirmar se muestra y deja
 * editar. Éxito → toast "Cambio #N registrado" y redirección a su detalle.
 *
 * Si la venta no admite cambio (`can_exchange` en `false`: plazo vencido,
 * anulada o sin unidades) no muestra el formulario sino un `StateMessage` con
 * el motivo y el enlace a la venta. Salir con una selección pide confirmar.
 */
export function ExchangeNewPage() {
  const { id } = useParams();
  const saleId = /^\d+$/.test(id ?? "") ? Number(id) : null;
  const navigate = useNavigate();
  const { data: sale, isPending, isError, error, refetch } = useSale(saleId);
  const { mutate: createExchange, isPending: saving } = useCreateExchange();

  const [returned, setReturned] = useState<ReturnedQuantities>({});
  const [newLines, setNewLines] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [note, setNote] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  useDocumentTitle(
    saleId ? `Cambio de la venta #${saleId} · Char` : "Cambio · Char",
  );
  useBreadcrumbLabel(saleId ? `Cambio de la venta #${saleId}` : null);

  const request = sale
    ? buildExchangeRequest(sale.id, sale.items, returned, newLines)
    : null;
  const preview = useExchangePreview(request);
  const result = request ? preview.data : undefined;
  const previewError = request && preview.isError ? preview.error : null;
  const sign = result ? differenceSign(result.difference) : null;

  const dirty = request !== null || newLines.length > 0;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      createdId === null &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  // Va después de `useBlocker`: así el bloqueo ya se levantó al navegar.
  useEffect(() => {
    if (createdId !== null) {
      void navigate(exchangePath(createdId), { replace: true });
    }
  }, [createdId, navigate]);
  useEffect(() => {
    if (!dirty || createdId !== null) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, createdId]);

  const back = (
    <Button
      variant="secondary"
      className="w-fit"
      render={<Link to={saleId ? salePath(saleId) : "/admin/sales"} />}
      nativeButton={false}
    >
      <ArrowLeft /> Volver a la venta
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
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!sale.can_exchange) {
    const reason =
      sale.status === "anulada"
        ? "La venta está anulada."
        : sale.exchange_deadline < todayInBuenosAires()
          ? `El plazo de cambio venció el ${formatDeadline(sale.exchange_deadline)}.`
          : "Todas las unidades de esta venta ya se cambiaron.";
    return (
      <div className="flex flex-col gap-6">
        {back}
        <StateMessage
          variant="empty"
          action={
            <Button
              variant="secondary"
              render={<Link to={salePath(sale.id)} />}
              nativeButton={false}
            >
              Ver venta #{sale.id}
            </Button>
          }
        >
          No se puede cambiar esta venta. {reason}
        </StateMessage>
      </div>
    );
  }

  const blockedVariants = returnedVariantIds(sale.items, returned);
  const shortage = previewError ? parseStockShortage(previewError) : null;
  const needsPayment = sign === 1;
  const canConfirm =
    !!request &&
    !!result &&
    !preview.isCalculating &&
    !previewError &&
    !saving &&
    (!needsPayment || paymentMethod !== "");

  const changeReturned = (
    item: (typeof sale.items)[number],
    quantity: number,
  ) => {
    setReturned((prev) => setReturnedQuantity(prev, item, quantity));
    setSubmitError(null);
    // Lo que se devuelve no se puede llevar: si estaba en "Se lleva", sale de ahí.
    if (quantity >= 1) {
      setNewLines((prev) => removeLine(prev, item.variant));
    }
  };
  const changeNewLines = (next: CartLine[]) => {
    setNewLines(next);
    setSubmitError(null);
  };

  const confirm = () => {
    if (!request || !canConfirm) return;
    setSubmitError(null);
    createExchange(
      {
        ...request,
        ...(needsPayment && paymentMethod
          ? { payment_method: paymentMethod }
          : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      },
      {
        onSuccess: (created) => {
          toast.success(`Cambio #${created.id} registrado`);
          setCreatedId(created.id);
        },
        onError: (err) => {
          const lack = parseStockShortage(err);
          if (lack) setNewLines((prev) => applyShortage(prev, lack));
          setSubmitError(stockErrorMessage(err));
        },
      },
    );
  };

  const shownError =
    submitError ?? (previewError ? stockErrorMessage(previewError) : null);

  return (
    <div className="flex flex-col gap-6">
      {back}
      <PageHeader
        title={`Cambio de la venta #${sale.id}`}
        description={`${saleClientLabel(sale.client_name)} · plazo hasta el ${formatDeadline(sale.exchange_deadline)}. Lo que se devuelve vale lo que se pagó; lo que se lleva, el precio vigente hoy. No se devuelve dinero.`}
      />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card className="gap-0 py-0" role="region" aria-label="Devuelve">
          <h2 className="border-b p-4 text-base font-semibold">1. Devuelve</h2>
          <ul>
            {sale.items.map((item) => {
              const qty = returned[item.id] ?? 0;
              const none = item.exchangeable_quantity === 0;
              const inputId = `return-${item.id}`;
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 border-b px-4 py-3 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={inputId}
                      checked={qty > 0}
                      disabled={none}
                      onCheckedChange={(checked) =>
                        changeReturned(item, checked ? 1 : 0)
                      }
                    />
                    <Label
                      htmlFor={inputId}
                      className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5"
                    >
                      <span className="font-medium">{item.product_name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        <VariantColor
                          name={item.color_name}
                          hex={item.color_hex}
                        />{" "}
                        · {item.size_name} ·{" "}
                        <span className="font-mono">{item.sku}</span>
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        Pagó {formatSaleMoney(item.unit_price)} c/u
                        {none
                          ? " · ya cambiada (0 disponibles)"
                          : ` · hasta ${item.exchangeable_quantity}`}
                      </span>
                    </Label>
                  </div>
                  {qty > 0 ? (
                    <div className="flex items-center gap-2 pl-7">
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label={`Devolver una unidad menos de ${item.product_name} ${item.size_name}`}
                        onClick={() => changeReturned(item, qty - 1)}
                      >
                        <Minus />
                      </Button>
                      <span
                        className="min-w-6 text-center font-semibold tabular-nums"
                        aria-label={`Cantidad a devolver: ${qty}`}
                      >
                        {qty}
                      </span>
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label={`Devolver una unidad más de ${item.product_name} ${item.size_name}`}
                        disabled={qty >= item.exchangeable_quantity}
                        onClick={() => changeReturned(item, qty + 1)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>
        <section aria-label="Se lleva" className="flex flex-col gap-4">
          <h2 className="text-base font-semibold">2. Se lleva (opcional)</h2>
          <VariantPicker
            placeholder="Buscar producto o SKU…"
            onAdd={(variant) => changeNewLines(addToCart(newLines, variant))}
            getDisabledReason={(variant) =>
              blockedVariants.has(variant.id)
                ? "Se está devolviendo"
                : addBlockedReason(newLines, variant)
            }
          />
          {newLines.length > 0 ? (
            <Card className="gap-0 py-0">
              <ul aria-label="Prendas que se lleva">
                {newLines.map((line) => (
                  <SaleCartLine
                    key={line.variant.id}
                    variant={line.variant}
                    quantity={line.quantity}
                    discountPercent={0}
                    shortage={
                      shortage?.variantId === line.variant.id
                        ? shortage.available
                        : null
                    }
                    onQuantityChange={(quantity) =>
                      changeNewLines(
                        setLineQuantity(newLines, line.variant.id, quantity),
                      )
                    }
                    onRemove={() =>
                      changeNewLines(removeLine(newLines, line.variant.id))
                    }
                  />
                ))}
              </ul>
            </Card>
          ) : null}
        </section>
      </div>
      <Card className="gap-4 p-4" role="region" aria-label="Balance">
        <h2 className="text-base font-semibold">Balance</h2>
        {!request ? (
          <p className="text-sm text-muted-foreground">
            Elegí qué devuelve el cliente para ver el balance.
          </p>
        ) : result ? (
          <ExchangeBalance
            returnedTotal={result.returned_total}
            newTotal={result.new_total}
            difference={result.difference}
            unreturnedAmount={result.unreturned_amount}
            paymentMethod={needsPayment ? paymentMethod : ""}
            loading={preview.isCalculating}
          />
        ) : !previewError ? (
          <div role="status">
            <span className="sr-only">Calculando el balance…</span>
            <Skeleton className="h-14 w-full" />
          </div>
        ) : null}
        {shownError ? (
          <Notice
            variant="danger"
            title={
              submitError ? "No se registró el cambio" : "No se pudo calcular"
            }
          >
            {shownError}
          </Notice>
        ) : null}
        {result && sign === -1 ? (
          <Notice variant="warning" title="No se devuelve dinero">
            Lo que se lleva vale {formatSaleMoney(result.unreturned_amount)}{" "}
            menos. Esos {formatSaleMoney(result.unreturned_amount)} quedan sin
            compensar.{" "}
            {newLines.length > 0
              ? "El cliente puede sumar otra prenda para igualar. "
              : "El cliente no se lleva nada: todo el valor queda sin compensar. "}
            Se puede confirmar igual.
          </Notice>
        ) : null}
        {needsPayment ? (
          <PaymentMethodSelect
            legend="Medio de pago de la diferencia"
            value={paymentMethod}
            onChange={setPaymentMethod}
            disabled={saving}
          />
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="exchange-note">Nota (opcional)</Label>
          <Input
            id="exchange-note"
            maxLength={SALE_NOTE_MAX_LENGTH}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            render={<Link to={salePath(sale.id)} />}
            nativeButton={false}
          >
            Cancelar
          </Button>
          <Button variant="success" disabled={!canConfirm} onClick={confirm}>
            {saving ? "Confirmando…" : "Confirmar cambio"}
          </Button>
        </div>
        {needsPayment && paymentMethod === "" ? (
          <p className="text-xs text-muted-foreground">
            Elegí el medio de pago de la diferencia para confirmar.
          </p>
        ) : null}
      </Card>
      <AlertDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => !open && blocker.reset?.()}
        variant="warning"
        title="¿Descartar el cambio en curso?"
        description="Tenés una selección sin confirmar. Si salís ahora se pierde."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
