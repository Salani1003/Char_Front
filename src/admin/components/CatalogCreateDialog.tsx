import { useState, type FormEventHandler, type ReactNode } from "react";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { Dialog } from "@/components/char/dialog";

/**
 * Armazón común de los modales de alta de catálogo ("Nueva marca", "Nuevo
 * color", ...), el patrón de `ClientFormDialog`: `Dialog` + `<form>` con pie
 * "Cancelar" / "Crear y seleccionar".
 *
 * - El botón principal queda deshabilitado y con texto de progreso mientras
 *   `isSubmitting`.
 * - Cerrar (Esc, la X, "Cancelar" o click fuera) con datos sin guardar
 *   (`isDirty`) pide confirmación con un `AlertDialog` ("¿Descartar lo que
 *   escribiste?"); sin cambios cierra directo. Mientras guarda no se cierra.
 * - `errorMessage` (error que no corresponde a un campo) se muestra en un
 *   `AlertDialog` de error.
 *
 * El foco queda atrapado en el modal y vuelve al elemento que lo abrió al
 * cerrarse (lo resuelve el primitivo del `Dialog`).
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado; el padre resetea el formulario al cerrar.
 * @param title Título del modal.
 * @param description Texto breve bajo el título.
 * @param isDirty Si hay datos sin guardar (activa la confirmación de descarte).
 * @param isSubmitting Si se está guardando.
 * @param onSubmit Handler del `<form>` (ej. `handleSubmit(...)`).
 * @param errorMessage Error general a mostrar en una alerta; `null` si no hay.
 * @param onErrorClose Se llama al cerrar la alerta de error.
 * @param children Los campos del formulario.
 */
export function CatalogCreateDialog({
  open,
  onOpenChange,
  title,
  description,
  isDirty,
  isSubmitting,
  onSubmit,
  errorMessage,
  onErrorClose,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isDirty: boolean;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  errorMessage: string | null;
  onErrorClose: () => void;
  children: ReactNode;
}) {
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const requestClose = () => {
    if (isSubmitting) return;
    if (isDirty) setConfirmingDiscard(true);
    else onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : requestClose())}
      title={title}
      description={description}
    >
      <form
        onSubmit={(event) => {
          // El modal vive (en el árbol de React) dentro del formulario de la
          // pantalla: sin esto el submit burbujea y también guardaría el producto.
          event.stopPropagation();
          return onSubmit(event);
        }}
        noValidate
        className="flex flex-col gap-5"
      >
        {children}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={requestClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando…" : "Crear y seleccionar"}
          </Button>
        </div>
      </form>
      <AlertDialog
        open={confirmingDiscard}
        onOpenChange={setConfirmingDiscard}
        variant="warning"
        title="¿Descartar lo que escribiste?"
        description="Si cerrás ahora se pierden los datos que no guardaste."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        onConfirm={() => onOpenChange(false)}
      />
      <AlertDialog
        open={errorMessage !== null}
        onOpenChange={(next) => !next && onErrorClose()}
        variant="danger"
        title={errorMessage ?? ""}
      />
    </Dialog>
  );
}
