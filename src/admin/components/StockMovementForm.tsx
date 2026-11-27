import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Trash2 } from "lucide-react";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { Notice } from "@/components/char/notice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/char/tabs";
import { toast } from "@/components/char/sonner";
import { cn } from "@/lib/utils";
import { StockVariantCombobox } from "./StockVariantCombobox";
import { getStockLevelAction } from "../actions/stock-operations.action";
import {
  MANUAL_REASONS,
  STOCK_NOTE_MAX_LENGTH,
  type ManualStockKind,
} from "../config/stock-operations";
import { useCreateStockOperation } from "../hooks/useStockOperations";
import {
  getMovementLineState,
  stockErrorMessage,
  stockOperationPath,
  type MovementLine,
} from "../utils/stock";
import type { StockLevel } from "../interfaces/stock.interface";

const newLine = (
  level: StockLevel | null = null,
  quantity = "",
): MovementLine => ({
  key: crypto.randomUUID(),
  level,
  quantity,
});

/**
 * Formulario de "Nuevo movimiento" (`stock.add_stockmovement`): tipo (ingreso
 * o egreso), motivo (según el tipo; el primero por defecto), nota opcional y
 * una tabla de líneas (variante + cantidad). Cada línea muestra el "Stock
 * actual" y cuánto "Quedará en"; se valida localmente (variante repetida,
 * cantidad entera ≥ 1 y, en un egreso, stock suficiente) para que el 400 del
 * backend sea la excepción.
 *
 * Se envía **una sola vez** con todas las líneas (`POST /stock-operations/`,
 * todo o nada) y el botón se bloquea mientras la request está en curso (no hay
 * idempotencia). Si el backend rechaza el envío (ej. otro usuario movió stock)
 * se muestra su mensaje y se refrescan los saldos de las líneas para poder
 * reintentar. Al terminar bien navega al detalle de la operación creada.
 * "Cancelar" pide confirmación (los cambios se pierden) y, si se acepta, vuelve
 * a la pantalla de Stock (`/admin/inventory`).
 *
 * @param initialKind Tipo inicial (por defecto `ingreso`).
 * @param initialLevel Variante con la que arranca la primera línea (con cantidad 1), p. ej. desde los botones de la grilla de stock.
 */
export function StockMovementForm({
  initialKind = "ingreso",
  initialLevel = null,
}: {
  initialKind?: ManualStockKind;
  initialLevel?: StockLevel | null;
}) {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateStockOperation();
  const [kind, setKind] = useState<ManualStockKind>(initialKind);
  const [reason, setReason] = useState(MANUAL_REASONS[initialKind][0].value);
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<MovementLine[]>(() => [
    initialLevel ? newLine(initialLevel, "1") : newLine(),
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const states = lines.map((line, index) =>
    getMovementLineState(line, index, lines, kind),
  );
  const readyCount = states.filter((s) => s.ready).length;
  const units = states.reduce((sum, s) => sum + (s.ready ? s.quantity! : 0), 0);
  const hasPending = lines.some(
    (line, i) =>
      (line.level !== null || line.quantity.trim() !== "") && !states[i].ready,
  );
  const canSubmit = readyCount > 0 && !hasPending && !isPending;

  const changeKind = (next: ManualStockKind) => {
    setKind(next);
    setReason(MANUAL_REASONS[next][0].value);
    setFormError(null);
  };

  const updateLine = (key: string, changes: Partial<MovementLine>) => {
    setFormError(null);
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...changes } : line)),
    );
  };

  /** Vuelve a pedir el saldo de las variantes elegidas (otro usuario pudo moverlo). */
  const refreshLevels = async () => {
    const ids = lines.flatMap((l) => (l.level ? [l.level.id] : []));
    const fresh = await Promise.all(
      ids.map((id) => getStockLevelAction(id).catch(() => null)),
    );
    setLines((prev) =>
      prev.map((line) => {
        const level = fresh.find((f) => f?.id === line.level?.id);
        return level ? { ...line, level } : line;
      }),
    );
  };

  const submit = () => {
    if (!canSubmit) return;
    mutate(
      {
        kind,
        reason,
        note: note.trim() || undefined,
        items: lines.flatMap((line, i) =>
          states[i].ready
            ? [{ variant: line.level!.id, quantity: states[i].quantity! }]
            : [],
        ),
      },
      {
        onSuccess: (operation) => {
          toast.success(
            `Se registró ${kind === "ingreso" ? "el ingreso" : "el egreso"} #${operation.id}`,
          );
          void navigate(stockOperationPath(operation.id));
        },
        onError: (error) => {
          setFormError(stockErrorMessage(error));
          void refreshLevels();
        },
      },
    );
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <section className="flex flex-col gap-4 rounded-card bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        <div className="grid gap-4 md:grid-cols-[auto_minmax(16rem,1fr)_minmax(0,2fr)] md:gap-x-8">
          <div className="flex flex-col gap-2">
            <span id="movement-kind-label" className="text-sm font-medium">
              Tipo
            </span>
            <Tabs
              value={kind}
              onValueChange={(next) => changeKind(next as ManualStockKind)}
            >
              <TabsList aria-labelledby="movement-kind-label">
                <TabsTrigger value="ingreso">Ingreso</TabsTrigger>
                <TabsTrigger value="egreso">Egreso</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col gap-2">
            <Label id="movement-reason-label">Motivo</Label>
            <Select
              items={Object.fromEntries(
                MANUAL_REASONS[kind].map((r) => [r.value, r.label]),
              )}
              value={reason}
              onValueChange={(next) => setReason(String(next))}
            >
              <SelectTrigger
                aria-labelledby="movement-reason-label"
                className="h-9 w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-64">
                {MANUAL_REASONS[kind].map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="movement-note">Nota (opcional)</Label>
            <Input
              id="movement-note"
              maxLength={STOCK_NOTE_MAX_LENGTH}
              placeholder="Ej: pedido proveedor Norte"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="overflow-x-auto rounded-card bg-card ring-1 ring-foreground/10">
        <table className="w-full min-w-3xl border-collapse text-sm">
          <caption className="sr-only">Líneas del movimiento</caption>
          <thead>
            <tr className="border-b border-border-soft text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <th scope="col" className="px-4 py-3">
                Variante
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Cantidad
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Stock actual
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Quedará en
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Quitar</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const state = states[index];
              const errorId = `movement-line-error-${line.key}`;
              return (
                <tr
                  key={line.key}
                  className="border-b border-border-soft align-top last:border-b-0"
                >
                  <td className="w-full min-w-72 px-4 py-3">
                    <StockVariantCombobox
                      value={line.level}
                      onChange={(level) => updateLine(line.key, { level })}
                      error={!!state.error}
                      aria-label={`Variante de la línea ${index + 1}`}
                      aria-describedby={state.error ? errorId : undefined}
                    />
                    {state.error ? (
                      <p id={errorId} className="mt-1 text-xs text-danger">
                        {state.error}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      size="sm"
                      className="ml-auto w-20 text-right tabular-nums"
                      aria-label={`Cantidad de la línea ${index + 1}`}
                      value={line.quantity}
                      onChange={(event) =>
                        updateLine(line.key, { quantity: event.target.value })
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="inline-block py-1.5">
                      {line.level ? line.level.quantity : "–"}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-bold tabular-nums",
                    )}
                  >
                    <span className="inline-block py-1.5">
                      {state.after ?? "–"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost-danger"
                      size="icon"
                      aria-label={`Quitar línea ${index + 1}`}
                      disabled={lines.length === 1}
                      onClick={() =>
                        setLines((prev) =>
                          prev.filter((l) => l.key !== line.key),
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-4 py-3">
          <Button
            type="button"
            variant="magenta"
            onClick={() => setLines((prev) => [...prev, newLine()])}
          >
            <Plus /> Agregar línea
          </Button>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {readyCount > 0
              ? `${readyCount} ${readyCount === 1 ? "línea" : "líneas"} · ${units} ${units === 1 ? "unidad" : "unidades"}`
              : "Todavía no hay líneas completas"}
          </span>
        </div>
      </section>

      {formError ? (
        <Notice variant="danger" title="No se pudo registrar el movimiento">
          {formError} No se aplicó ninguna línea.
        </Notice>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() => setConfirmingCancel(true)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {readyCount > 0
            ? `Registrar ${kind} de ${readyCount} ${readyCount === 1 ? "línea" : "líneas"}`
            : "Registrar"}
        </Button>
      </div>
      <AlertDialog
        open={confirmingCancel}
        onOpenChange={setConfirmingCancel}
        variant="warning"
        title="¿Cancelar el movimiento?"
        description="Si continuás, los cambios que cargaste se perderán."
        confirmLabel="Sí, descartar"
        cancelLabel="Seguir editando"
        onConfirm={() => void navigate("/admin/inventory")}
      />
    </form>
  );
}
