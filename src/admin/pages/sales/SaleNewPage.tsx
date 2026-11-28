import { useEffect, useState } from "react";
import { Link, useBlocker, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { Card } from "@/components/char/card";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { Notice } from "@/components/char/notice";
import { PageHeader } from "@/components/char/page-header";
import { StateMessage } from "@/components/char/state-message";
import { toast } from "@/components/char/sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ClientCombobox } from "@/admin/components/ClientCombobox";
import { ClientFormDialog } from "@/admin/components/ClientFormDialog";
import { DiscountSelect } from "@/admin/components/DiscountSelect";
import { PaymentMethodSelect } from "@/admin/components/PaymentMethodSelect";
import { SaleCartLine } from "@/admin/components/SaleCartLine";
import { VariantPicker } from "@/admin/components/VariantPicker";
import {
  formatSaleMoney,
  SALE_NOTE_MAX_LENGTH,
  type DiscountPercent,
} from "@/admin/config/sales";
import { useCreateSale } from "@/admin/hooks/useSales";
import type { Client } from "@/admin/interfaces/client.interface";
import {
  addBlockedReason,
  addToCart,
  applyShortage,
  buildCreateSaleRequest,
  estimateCart,
  parseStockShortage,
  removeLine,
  setLineQuantity,
  type CartLine,
  type SaleDraft,
} from "@/admin/utils/saleCart";
import { salePath } from "@/admin/utils/sales";
import { stockErrorMessage } from "@/admin/utils/stock";

const SALES_PATH = "/admin/sales";

/** Un UUID por intento de cobro (evita duplicar la venta ante doble clic o reintento). */
const newIdempotencyKey = () => crypto.randomUUID();

const EMPTY_DRAFT: SaleDraft = {
  paymentMethod: "",
  clientId: null,
  discountPercent: 0,
  discountReason: "",
  note: "",
};

/**
 * Punto de venta (`/admin/sales/new`, permiso `sales.add_sale`): una sola
 * pantalla para el mostrador, con el teclado primero. A la izquierda el
 * `VariantPicker` (el buscador toma el foco al entrar y después de cada ítem);
 * a la derecha el carrito (sticky desde `lg`): cliente opcional (con "+ Nuevo
 * cliente"), líneas con cantidad acotada al stock conocido, descuento
 * (`DiscountSelect`, solo con `sales.apply_discount`; con 5 % o 10 % aparece el
 * motivo), medio de pago obligatorio y sin valor por defecto, nota y totales.
 *
 * - **El front nunca envía precios.** Los totales de pantalla son una
 *   estimación con `current_price` (`estimateCart`); el total cobrado es el que
 *   devuelve el backend.
 * - **Idempotencia:** la `idempotency_key` se genera al entrar y se reenvía en
 *   cada reintento; se regenera solo al vaciar el carrito (tras un cobro
 *   exitoso se sale de la pantalla). "Cobrar" se bloquea mientras la request
 *   está en curso y queda deshabilitado sin ítems o sin medio de pago.
 * - **Éxito (201 o 200):** toast "Venta #N registrada" (con "Nueva venta") y
 *   redirección al detalle.
 * - **Sin stock (400 con `variant`/`available`):** la línea se resalta con
 *   "Quedan N", se ajusta su cantidad y el carrito se conserva. Cualquier otro
 *   error (400/403/429/red) se muestra con el mensaje del servidor en un
 *   `Notice` sobre el carrito.
 * - Salir con el carrito cargado pide confirmar el descarte (`useBlocker` y
 *   `beforeunload`).
 */
export function SaleNewPage() {
  useDocumentTitle("Nueva venta · Char");
  const navigate = useNavigate();
  const can = useCan();
  const canDiscount = can(PERMISSIONS.sales.applyDiscount);
  const { mutate: createSale, isPending } = useCreateSale();

  const [lines, setLines] = useState<CartLine[]>([]);
  const [draft, setDraft] = useState<SaleDraft>(EMPTY_DRAFT);
  const [client, setClient] = useState<Client | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [error, setError] = useState<string | null>(null);
  const [shortage, setShortage] = useState<{
    variantId: number;
    available: number;
  } | null>(null);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const totals = estimateCart(lines, draft.discountPercent);
  const request = buildCreateSaleRequest(lines, draft, idempotencyKey);
  const dirty = lines.length > 0;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      createdId === null &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  // Va después de `useBlocker`: así el bloqueo ya se levantó al navegar.
  useEffect(() => {
    if (createdId !== null) {
      void navigate(salePath(createdId), { replace: true });
    }
  }, [createdId, navigate]);

  useEffect(() => {
    if (!dirty || createdId !== null) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, createdId]);

  const clearFeedback = () => {
    setError(null);
    setShortage(null);
  };

  const changeLines = (next: CartLine[]) => {
    setLines(next);
    clearFeedback();
    // Carrito vaciado: es un cobro nuevo, con su propia clave.
    if (next.length === 0) setIdempotencyKey(newIdempotencyKey());
  };

  const updateDraft = (changes: Partial<SaleDraft>) => {
    setDraft((prev) => ({ ...prev, ...changes }));
    setError(null);
  };

  const charge = () => {
    if (!request || isPending) return;
    setError(null);
    setShortage(null);
    createSale(request, {
      onSuccess: (sale) => {
        toast.success(`Venta #${sale.id} registrada`, {
          description: `Total cobrado: ${formatSaleMoney(sale.total)}`,
          action: {
            label: "Nueva venta",
            onClick: () => void navigate("/admin/sales/new"),
          },
        });
        setCreatedId(sale.id);
      },
      onError: (err) => {
        const lack = parseStockShortage(err);
        if (lack) {
          setShortage({ variantId: lack.variantId, available: lack.available });
          setLines((prev) => applyShortage(prev, lack));
        }
        setError(stockErrorMessage(err));
      },
    });
  };

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

  return (
    <div className="flex flex-col gap-6">
      {back}
      <PageHeader
        title="Nueva venta"
        description="Buscá la prenda, agregala al carrito y cobrá. El precio lo calcula el sistema al registrar la venta: acá se muestra como referencia."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <section aria-label="Productos" className="flex flex-col gap-4">
          <VariantPicker
            onAdd={(variant) => changeLines(addToCart(lines, variant))}
            getDisabledReason={(variant) => addBlockedReason(lines, variant)}
          />
        </section>
        <Card
          aria-label="Carrito"
          className="gap-0 py-0 lg:sticky lg:top-4"
          role="region"
        >
          <div className="flex flex-col gap-2 border-b p-4">
            <Label htmlFor="sale-client">Cliente</Label>
            <ClientCombobox
              id="sale-client"
              value={client}
              onChange={(next) => {
                setClient(next);
                updateDraft({ clientId: next?.id ?? null });
              }}
              onCreate={
                can(PERMISSIONS.clients.add)
                  ? () => setClientDialogOpen(true)
                  : undefined
              }
              disabled={isPending}
            />
          </div>
          {lines.length === 0 ? (
            <div className="border-b p-4">
              <StateMessage variant="empty">
                El carrito está vacío. Agregá una variante de la lista.
              </StateMessage>
            </div>
          ) : (
            <ul aria-label="Ítems del carrito" className="border-b">
              {lines.map((line) => (
                <SaleCartLine
                  key={line.variant.id}
                  variant={line.variant}
                  quantity={line.quantity}
                  discountPercent={draft.discountPercent}
                  shortage={
                    shortage?.variantId === line.variant.id
                      ? shortage.available
                      : null
                  }
                  onQuantityChange={(quantity) =>
                    changeLines(
                      setLineQuantity(lines, line.variant.id, quantity),
                    )
                  }
                  onRemove={() =>
                    changeLines(removeLine(lines, line.variant.id))
                  }
                />
              ))}
            </ul>
          )}
          {error ? (
            <div className="border-b p-4">
              <Notice variant="danger" title="No se registró la venta">
                {error}
                {shortage ? " No se guardó nada." : ""}
              </Notice>
            </div>
          ) : null}
          <div className="flex flex-col gap-4 border-b p-4">
            {canDiscount ? (
              <>
                <DiscountSelect
                  value={draft.discountPercent}
                  onChange={(value: DiscountPercent) =>
                    updateDraft({
                      discountPercent: value,
                      discountReason: value === 0 ? "" : draft.discountReason,
                    })
                  }
                  disabled={isPending}
                />
                {draft.discountPercent > 0 ? (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="sale-discount-reason">
                      Motivo del descuento (opcional)
                    </Label>
                    <Input
                      id="sale-discount-reason"
                      maxLength={200}
                      value={draft.discountReason}
                      onChange={(event) =>
                        updateDraft({ discountReason: event.target.value })
                      }
                    />
                  </div>
                ) : null}
              </>
            ) : null}
            <PaymentMethodSelect
              value={draft.paymentMethod}
              onChange={(paymentMethod) => updateDraft({ paymentMethod })}
              disabled={isPending}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="sale-note">Nota (opcional)</Label>
              <Input
                id="sale-note"
                maxLength={SALE_NOTE_MAX_LENGTH}
                value={draft.note}
                onChange={(event) => updateDraft({ note: event.target.value })}
              />
            </div>
          </div>
          <dl className="flex flex-col gap-1 p-4 text-sm tabular-nums">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatSaleMoney(totals.subtotal)}</dd>
            </div>
            {draft.discountPercent > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  Descuento {draft.discountPercent} %
                </dt>
                <dd>−{formatSaleMoney(totals.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t pt-2 text-lg font-bold">
              <dt>Total estimado</dt>
              <dd>{formatSaleMoney(totals.total)}</dd>
            </div>
            <p className="text-xs text-muted-foreground">
              El total definitivo lo informa el servidor.
            </p>
          </dl>
          <div className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              disabled={!dirty || isPending}
              onClick={() => {
                setDraft(EMPTY_DRAFT);
                setClient(null);
                changeLines([]);
              }}
            >
              Vaciar
            </Button>
            <Button
              variant="success"
              disabled={!request || isPending}
              onClick={charge}
            >
              {isPending
                ? "Cobrando…"
                : lines.length
                  ? `Cobrar ${formatSaleMoney(totals.total)}`
                  : "Cobrar"}
            </Button>
          </div>
          {lines.length > 0 && draft.paymentMethod === "" ? (
            <p className="px-4 pb-4 text-xs text-muted-foreground">
              Elegí el medio de pago para poder cobrar.
            </p>
          ) : null}
        </Card>
      </div>
      <ClientFormDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        onCreated={(created) => {
          setClient(created);
          updateDraft({ clientId: created.id });
        }}
      />
      <AlertDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => !open && blocker.reset?.()}
        variant="warning"
        title="¿Descartar la venta en curso?"
        description="El carrito tiene ítems sin cobrar. Si salís ahora se pierden."
        confirmLabel="Descartar"
        cancelLabel="Seguir vendiendo"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
