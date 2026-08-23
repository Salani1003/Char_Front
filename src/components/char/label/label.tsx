import type { ComponentProps } from "react";
import { Label as BaseLabel } from "@/components/ui/label";
import { cn } from "@/lib/utils";
/**
 * Etiqueta de campo de Char. Envuelve el primitivo de `components/ui/label`
 * y agrega el indicador visual de campo obligatorio propio del Design
 * System de Char.
 *
 * @param required Si es `true`, agrega un asterisco en color `danger`.
 */
export function Label({
  required,
  className,
  children,
  ...props
}: ComponentProps<typeof BaseLabel> & { required?: boolean }) {
  return (
    <BaseLabel className={cn(className)} {...props}>
      {children}
      {required && (
        <span aria-hidden="true" className="text-danger">
          *
        </span>
      )}
    </BaseLabel>
  );
}
