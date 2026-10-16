import type { ReactNode } from "react";
import {
  Dialog as BaseDialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Modal de contenido de Char (formularios, detalles) con título, descripción
 * opcional y botón de cerrar. Se cierra con Escape, con la X o al hacer click
 * fuera. Es controlado: la pantalla guarda `open`. Para confirmaciones y avisos
 * de una sola decisión usar `AlertDialog`. Mobile-first: ocupa el ancho de la
 * pantalla menos un margen y scrollea si el contenido no entra.
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado cuando se abre o cierra.
 * @param title Título del modal.
 * @param description Texto breve bajo el título.
 * @param children Contenido del modal (ej. un formulario con sus botones).
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-1 pr-6">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </div>
        {children}
      </DialogContent>
    </BaseDialog>
  );
}
