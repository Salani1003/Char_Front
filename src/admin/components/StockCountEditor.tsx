import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Trash2 } from "lucide-react";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { Notice } from "@/components/char/notice";
import { toast } from "@/components/char/sonner";
import { cn } from "@/lib/utils";
import { StockVariantCombobox } from "./StockVariantCombobox";
import {
  useAllStockLevels,
  useCancelStockCount,
  useConfirmStockCount,
  useCreateStockCount,
  useSaveStockCountDraft,
} from "../hooks/useStockCounts";
import {
  countDifference,
  parseCounted,
  stockCountPath,
  stockErrorMessage,
  summarizeDifferences,
  type CountLine,
} from "../utils/stock";
import { STOCK_NOTE_MAX_LENGTH } from "../config/stock-operations";
import type { StockCountDetail } from "../interfaces/stock-count.interface";
import type { StockLevel } from "../interfaces/stock.interface";

const lineFromLevel = (level: StockLevel, counted: string): CountLine => ({
  variant: level.id,
  sku: level.sku,
  product_name: level.product_name,
  color_name: level.color_name,
  size_name: level.size_name,
  counted,
});

const diffText = (difference: number | null) =>
  difference === null
    ? "–"
    : difference === 0
      ? "sin cambio"
      : `${difference > 0 ? "+" : "−"}${Math.abs(difference)}`;

/**
 * Editor de un recuento **en borrador** (`StockCountPage`) o de uno nuevo todavía sin guardar (`StockCountNewPage`). Cada línea lleva lo
 * **contado** (no un "+2"): al confirmar el servidor calcula la diferencia con
 * el saldo de ese momento. Las columnas "En sistema hoy" y la diferencia son
 * una **estimación** con `GET /stock/` (el borrador no trae el saldo), y puede
 * cambiar si hubo movimientos antes de confirmar.
 *
 * - Agregar: buscador de variante, o "Cargar todas las variantes" (con su
 *   saldo como punto de partida; un recuento "general" debe incluirlas todas,
 *   también las que cuentan 0). Un recuento es parcial: lo que no se carga
 *   conserva su saldo.
 * - "Guardar borrador" envía lo cambiado (`items/bulk/`, quita las líneas
 *   eliminadas y actualiza la nota). Las líneas sin cantidad válida no se
 *   guardan. El borrador no toca el stock.
 * - "Confirmar recuento" está deshabilitado con cambios sin guardar, con
 *   líneas sin contar o sin líneas, y pide confirmación mostrando cuántas
 *   suben, bajan o no cambian. Si algo falla no se ajusta nada.
 * - "Cancelar recuento" pide confirmación y vuelve a la lista de recuentos
 *   (`/admin/inventory?view=counts`). Si el recuento **nunca se guardó**
 *   (`count === null`) no llama al backend; si ya es un borrador guardado,
 *   lo cancela en el servidor (`POST …/cancel/`; queda con estado Cancelado).
 * - Un recuento **nuevo** (`count === null`, pantalla `StockCountNewPage`) vive
 *   solo en pantalla: el primer "Guardar borrador" lo crea
 *   (`POST /stock-counts/` con nota y líneas) y navega a su pantalla; "Confirmar"
 *   queda deshabilitado hasta entonces.
 *
 * Con `canEdit` en `false` (sin `stock.add_stockcount`) todo es de solo lectura.
 * Mantiene su estado local: el padre le pone `key` con el contenido guardado
 * para que se reinicie al refrescarse el recuento.
 *
 * @param count Recuento en borrador con sus líneas, o `null` si es nuevo y aún no se guardó.
 * @param canEdit Si la persona puede modificarlo.
 */
export function StockCountEditor({
  count,
  canEdit,
}: {
  count: StockCountDetail | null;
  canEdit: boolean;
}) {
  const navigate = useNavigate();
  const [note, setNote] = useState(count?.note ?? "");
  const [lines, setLines] = useState<CountLine[]>(() =>
    (count?.items ?? []).map((item) => ({
      variant: item.variant,
      sku: item.sku,
      product_name: item.product_name,
      color_name: item.color_name,
      size_name: item.size_name,
      counted: String(item.counted_quantity),
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"confirm" | "cancel" | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const levelsQuery = useAllStockLevels();
  const levels = new Map((levelsQuery.data ?? []).map((l) => [l.id, l]));
  const { mutate: save, isPending: saving } = useSaveStockCountDraft();
  const { mutate: confirm, isPending: confirming } = useConfirmStockCount();
  const { mutate: cancel, isPending: cancelling } = useCancelStockCount();
  const { mutate: create, isPending: creating } = useCreateStockCount();
  const serverItems = count?.items ?? [];

  const serverCounted = new Map(
    serverItems.map((i) => [i.variant, i.counted_quantity]),
  );
  const localIds = new Set(lines.map((l) => l.variant));
  const removed = serverItems
    .filter((i) => !localIds.has(i.variant))
    .map((i) => i.variant);
  const upserts = lines.flatMap((l) => {
    const value = parseCounted(l.counted);
    return value !== null && serverCounted.get(l.variant) !== value
      ? [{ variant: l.variant, counted_quantity: value }]
      : [];
  });
  const clearedOnServer = lines.some(
    (l) => serverCounted.has(l.variant) && parseCounted(l.counted) === null,
  );
  const noteChanged = note.trim() !== (count?.note ?? "");
  const dirty =
    removed.length > 0 || upserts.length > 0 || clearedOnServer || noteChanged;
  const uncounted = lines.filter((l) => parseCounted(l.counted) === null);
  const differences = lines.map((l) =>
    countDifference(l.counted, levels.get(l.variant)?.quantity),
  );
  const { up, down, same } = summarizeDifferences(differences);
  // Un recuento nuevo todavía no existe en el servidor: hay que guardarlo antes de confirmar.
  const canConfirm =
    canEdit &&
    count !== null &&
    !dirty &&
    lines.length > 0 &&
    uncounted.length === 0;
  const busy = saving || confirming || cancelling || creating;
  const changes = [
    up > 0 && `${up} con más stock`,
    down > 0 && `${down} con menos stock`,
    same > 0 && `${same} sin cambios`,
  ].filter(Boolean);
  const confirmMessage = `El stock se actualizará con las cantidades contadas${changes.length ? `: ${changes.join(", ")}` : ""}. Esta acción no se puede deshacer.`;

  const updateCounted = (variant: number, counted: string) => {
    setError(null);
    setLines((prev) =>
      prev.map((l) => (l.variant === variant ? { ...l, counted } : l)),
    );
  };

  const addLevel = (level: StockLevel | null) => {
    if (!level) return;
    if (localIds.has(level.id)) {
      toast.info("Esa variante ya está en el recuento.");
      return;
    }
    setLines((prev) => [...prev, lineFromLevel(level, "")]);
  };

  const loadAll = () => {
    const missing = (levelsQuery.data ?? []).filter((l) => !localIds.has(l.id));
    setLines((prev) => [
      ...prev,
      ...missing.map((l) => lineFromLevel(l, String(l.quantity))),
    ]);
    toast.success(
      `Se cargaron ${missing.length} variantes con su saldo actual. Corregí las que difieran.`,
    );
  };

  const saveDraft = () => {
    setError(null);
    if (count === null) {
      // Primer guardado: recién acá se crea el recuento en el servidor.
      create(
        { note: note.trim() || undefined, items: upserts },
        {
          onSuccess: (created) => {
            toast.success("Borrador guardado");
            void navigate(stockCountPath(created.id), { replace: true });
          },
          onError: (err) => setError(stockErrorMessage(err)),
        },
      );
      return;
    }
    save(
      {
        id: count.id,
        removed,
        upserts,
        note: noteChanged ? note.trim() : undefined,
      },
      {
        onSuccess: () => toast.success("Borrador guardado"),
        onError: (err) => setError(stockErrorMessage(err)),
      },
    );
  };

  const closeDialog = () => {
    setDialog(null);
    setDialogError(null);
  };

  const runConfirm = () =>
    count &&
    confirm(count.id, {
      onSuccess: () => {
        closeDialog();
        toast.success("Recuento confirmado", {
          description: "El stock se ajustó con lo contado.",
        });
      },
      onError: (err) => setDialogError(stockErrorMessage(err)),
    });

  const runCancel = () => {
    if (count === null) {
      // Nunca se guardó: no hay nada en el servidor que cancelar.
      closeDialog();
      void navigate("/admin/inventory?view=counts");
      return;
    }
    cancel(count.id, {
      onSuccess: () => {
        closeDialog();
        toast.success("Recuento cancelado", {
          description: "No se guardó nada y no se tocó el stock.",
        });
        void navigate("/admin/inventory?view=counts");
      },
      onError: (err) => setDialogError(stockErrorMessage(err)),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-card bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        <Label htmlFor="count-note">Nota</Label>
        <Input
          id="count-note"
          maxLength={STOCK_NOTE_MAX_LENGTH}
          placeholder="Ej: recuento de vidriera"
          value={note}
          disabled={!canEdit}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      {canEdit ? (
        <div className="flex flex-wrap items-end gap-3 rounded-card bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex min-w-64 flex-1 flex-col gap-2">
            <Label id="count-add-label">Agregar variante</Label>
            <StockVariantCombobox
              value={null}
              onChange={addLevel}
              aria-label="Agregar variante al recuento"
            />
          </div>
          <Button
            variant="magenta"
            disabled={!levelsQuery.data}
            onClick={loadAll}
          >
            <Plus /> Cargar todas las variantes
          </Button>
        </div>
      ) : null}

      <section className="overflow-x-auto rounded-card bg-card ring-1 ring-foreground/10">
        <table className="w-full min-w-3xl border-collapse text-sm">
          <caption className="sr-only">Líneas del recuento</caption>
          <thead>
            <tr className="border-b border-border-soft text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <th scope="col" className="px-4 py-3">
                Variante
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                En sistema hoy
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Contado
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Diferencia
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Quitar</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Sin líneas. Agregá variantes o cargá todas con su saldo actual
                  como punto de partida.
                </td>
              </tr>
            ) : (
              lines.map((line, index) => {
                const difference = differences[index];
                return (
                  <tr
                    key={line.variant}
                    className="border-b border-border-soft last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{line.product_name}</span>
                        <span className="text-xs text-muted-foreground">
                          <span className="font-mono">{line.sku}</span> ·{" "}
                          {line.color_name} · {line.size_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {levels.get(line.variant)?.quantity ?? "…"}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        size="sm"
                        className="ml-auto w-20 text-right tabular-nums"
                        aria-label={`Cantidad contada de ${line.sku}`}
                        aria-invalid={
                          line.counted !== "" &&
                          parseCounted(line.counted) === null
                            ? true
                            : undefined
                        }
                        value={line.counted}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateCounted(line.variant, event.target.value)
                        }
                      />
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-bold tabular-nums",
                        difference !== null && difference > 0 && "text-success",
                        difference !== null && difference < 0 && "text-danger",
                        (difference === null || difference === 0) &&
                          "font-normal text-muted-foreground",
                      )}
                    >
                      {diffText(difference)}
                    </td>
                    <td className="px-4 py-3">
                      {canEdit ? (
                        <Button
                          variant="ghost-danger"
                          size="icon"
                          aria-label={`Quitar ${line.sku} del recuento`}
                          onClick={() =>
                            setLines((prev) =>
                              prev.filter((l) => l.variant !== line.variant),
                            )
                          }
                        >
                          <Trash2 />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="border-t border-border-soft px-4 py-3 text-sm text-muted-foreground">
          {up} suben · {down} bajan · {same} sin cambios (estimado con el saldo
          de hoy)
        </div>
      </section>

      {levelsQuery.isError ? (
        <Notice variant="warning" title="No se pudo cargar el saldo actual">
          La columna "En sistema hoy" y la diferencia no están disponibles.
          Volvé a abrir el recuento para reintentar.
        </Notice>
      ) : null}
      {error ? (
        <Notice variant="danger" title="No se pudo guardar el borrador">
          {error}
        </Notice>
      ) : null}
      {canEdit && uncounted.length > 0 ? (
        <Notice variant="info">
          Hay {uncounted.length}{" "}
          {uncounted.length === 1 ? "línea sin contar" : "líneas sin contar"}:
          no se guardan y hay que completarlas o quitarlas para confirmar.
        </Notice>
      ) : null}

      {canEdit ? (
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            variant="ghost-danger"
            disabled={busy}
            onClick={() => setDialog("cancel")}
          >
            Cancelar recuento
          </Button>
          <Button
            variant="secondary"
            disabled={!dirty || busy}
            onClick={saveDraft}
          >
            Guardar borrador
          </Button>
          <Button
            disabled={!canConfirm || busy}
            onClick={() => setDialog("confirm")}
            title={dirty ? "Guardá el borrador antes de confirmar" : undefined}
          >
            Confirmar recuento
          </Button>
        </div>
      ) : null}

      <AlertDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && !busy && closeDialog()}
        variant={dialogError ? "danger" : "warning"}
        title={
          dialogError
            ? dialog === "confirm"
              ? "No se pudo confirmar el recuento"
              : "No se pudo cancelar el recuento"
            : dialog === "confirm"
              ? "¿Confirmar el recuento?"
              : "¿Cancelar el recuento?"
        }
        description={
          dialogError ??
          (dialog === "confirm"
            ? confirmMessage
            : "Si continuás, los cambios que cargaste se perderán y no se toca el stock. Volverás a la lista de recuentos.")
        }
        confirmLabel={
          dialogError
            ? "Cerrar"
            : dialog === "confirm"
              ? "Confirmar recuento"
              : "Cancelar recuento"
        }
        cancelLabel={dialogError ? undefined : "Volver"}
        closeOnConfirm={false}
        confirmDisabled={busy}
        onConfirm={
          dialogError
            ? closeDialog
            : dialog === "confirm"
              ? runConfirm
              : runCancel
        }
      />
    </div>
  );
}
