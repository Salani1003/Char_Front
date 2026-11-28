import { useState, type ReactNode } from "react";
import { Button } from "@/components/char/button";
import { Dialog } from "@/components/char/dialog";
import { Label } from "@/components/char/label";
import { Notice } from "@/components/char/notice";
import { Textarea } from "@/components/char/textarea";
import { SALE_NOTE_MAX_LENGTH } from "../config/sales";

/** Contenido del diálogo; vive solo mientras está abierto, así el motivo se reinicia en cada apertura. */
function VoidForm({
  description,
  confirmLabel,
  pending,
  error,
  errorExtra,
  onConfirm,
  onCancel,
}: {
  description: ReactNode;
  confirmLabel: string;
  pending: boolean;
  error: string | null;
  errorExtra?: ReactNode;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const missing = touched && reason.trim() === "";

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setTouched(true);
        if (pending || reason.trim() === "") return;
        onConfirm(reason.trim());
      }}
    >
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="void-reason" required>
          Motivo
        </Label>
        <Textarea
          id="void-reason"
          value={reason}
          maxLength={SALE_NOTE_MAX_LENGTH}
          aria-invalid={missing}
          aria-describedby={missing ? "void-reason-error" : undefined}
          placeholder="Ej: se cargó mal"
          onChange={(event) => setReason(event.target.value)}
        />
        {missing ? (
          <p
            id="void-reason-error"
            role="alert"
            className="text-sm text-danger"
          >
            Indicá el motivo de la anulación.
          </p>
        ) : null}
      </div>
      {error ? (
        <Notice variant="danger" title="No se pudo anular">
          {error}
          {errorExtra}
        </Notice>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="danger" disabled={pending}>
          {pending ? "Anulando…" : confirmLabel}
        </Button>
      </div>
    </form>
  );
}

/**
 * Diálogo de anulación con **motivo obligatorio** (máx. 500), reutilizable para
 * ventas y cambios. Es controlado y no hace la request: `onConfirm(reason)` la
 * dispara el padre (que decide cuándo cerrar). Un error del backend (cambios
 * activos, stock que ya no alcanza, ...) queda dentro del diálogo con el
 * mensaje del servidor tal cual, y `errorExtra` permite sumarle enlaces. No se
 * cierra mientras `pending`.
 *
 * @param open Si el diálogo está visible.
 * @param onOpenChange Se llama con el nuevo estado.
 * @param title Título (ej. "Anular venta #21").
 * @param description Qué pasa al anular y que no se puede deshacer.
 * @param confirmLabel Texto del botón de confirmación.
 * @param pending Si la anulación está en curso.
 * @param error Mensaje del backend, o `null`.
 * @param errorExtra Contenido extra bajo el error (ej. enlaces a los cambios activos).
 * @param onConfirm Recibe el motivo ya recortado.
 */
export function VoidDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pending,
  error,
  errorExtra,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pending: boolean;
  error: string | null;
  errorExtra?: ReactNode;
  onConfirm: (reason: string) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !pending && onOpenChange(next)}
      title={title}
    >
      <VoidForm
        description={description}
        confirmLabel={confirmLabel}
        pending={pending}
        error={error}
        errorExtra={errorExtra}
        onConfirm={onConfirm}
        onCancel={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
