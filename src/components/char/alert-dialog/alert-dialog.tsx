import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import {
  AlertDialog as BaseAlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/char/button";
import { cn } from "@/lib/utils";

const VARIANTS = {
  success: {
    icon: CircleCheck,
    iconClass: "bg-success/12 text-success",
    button: "primary",
  },
  warning: {
    icon: TriangleAlert,
    iconClass: "bg-warning/14 text-warning",
    button: "primary",
  },
  danger: {
    icon: CircleAlert,
    iconClass: "bg-danger/12 text-danger",
    button: "danger",
  },
  info: {
    icon: Info,
    iconClass: "bg-info/10 text-info",
    button: "primary",
  },
} as const;

export type CharAlertDialogVariant = keyof typeof VARIANTS;

/**
 * Diálogo de alerta modal de Char, al estilo SweetAlert: ícono según la
 * variante, título, descripción opcional y botones. Bloquea la pantalla hasta
 * que la persona responde; Escape o el botón de cancelar lo cierran sin
 * confirmar. Es controlado: la pantalla guarda `open`.
 *
 * Mobile-first: los botones se apilan (el principal arriba) y desde `sm` van
 * en fila a la derecha.
 *
 * @param open Si el diálogo está visible.
 * @param onOpenChange Se llama con `false` cuando se cierra por cualquier vía.
 * @param variant Rol visual: `success`, `warning`, `danger` o `info`.
 * @param title Título corto que dice qué pasó o qué se va a hacer.
 * @param description Detalle adicional.
 * @param confirmLabel Texto del botón de aceptar; por defecto "Aceptar".
 * @param onConfirm Se llama al aceptar; el diálogo se cierra después (salvo con `closeOnConfirm={false}`).
 * @param closeOnConfirm Si es `false`, aceptar NO cierra el diálogo: lo cierra la pantalla (ej. al terminar una request, o dejarlo abierto mostrando un error en `description`). Por defecto `true`.
 * @param confirmDisabled Deshabilita el botón de aceptar (ej. mientras corre la request).
 * @param cancelLabel Si se pasa, muestra el botón de cancelar con ese texto.
 * @param onCancel Se llama al cancelar con el botón.
 */
export function AlertDialog({
  open,
  onOpenChange,
  variant = "info",
  title,
  description,
  confirmLabel = "Aceptar",
  onConfirm,
  closeOnConfirm = true,
  confirmDisabled = false,
  cancelLabel,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: CharAlertDialogVariant;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  closeOnConfirm?: boolean;
  confirmDisabled?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
}) {
  const { icon: Icon, iconClass, button } = VARIANTS[variant];

  return (
    <BaseAlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="flex flex-col items-center gap-4 text-center">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full",
            iconClass,
          )}
        >
          <Icon className="size-7" aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </div>
        <div className="mt-2 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          {cancelLabel ? (
            <AlertDialogClose
              render={<Button variant="secondary" className="sm:min-w-28" />}
              onClick={onCancel}
            >
              {cancelLabel}
            </AlertDialogClose>
          ) : null}
          {closeOnConfirm ? (
            <AlertDialogClose
              render={
                <Button
                  variant={button}
                  className="sm:min-w-28"
                  disabled={confirmDisabled}
                />
              }
              onClick={onConfirm}
            >
              {confirmLabel}
            </AlertDialogClose>
          ) : (
            <Button
              type="button"
              variant={button}
              className="sm:min-w-28"
              disabled={confirmDisabled}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </AlertDialogContent>
    </BaseAlertDialog>
  );
}
