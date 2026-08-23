import type { ComponentProps, ReactNode } from "react";
import { Input as BaseInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";
const SIZE_CLASSES = {
  sm: "h-8 text-sm",
  md: "h-9 text-sm",
  lg: "h-12 px-4 text-base",
} as const;
export type CharInputSize = keyof typeof SIZE_CLASSES;
/**
 * Campo de texto de Char. Envuelve el primitivo de `components/ui/input` y
 * agrega la identidad visual y API de Char: tamaños semánticos (`sm`, `md`,
 * `lg`) e ícono inicial opcional. No integra react-hook-form — para eso ver
 * `components/forms/FormInput`.
 *
 * @param size Tamaño del control: `sm`, `md` (default) o `lg` (usado en
 * pantallas de auth).
 * @param icon Ícono mostrado al inicio del campo.
 */
export function Input({
  size = "md",
  icon,
  className,
  ...props
}: Omit<ComponentProps<typeof BaseInput>, "size"> & {
  size?: CharInputSize;
  icon?: ReactNode;
}) {
  if (!icon) {
    return (
      <BaseInput className={cn(SIZE_CLASSES[size], className)} {...props} />
    );
  }
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-muted-foreground">
        {icon}
      </span>
      <BaseInput
        className={cn(SIZE_CLASSES[size], "pl-8", className)}
        {...props}
      />
    </div>
  );
}
