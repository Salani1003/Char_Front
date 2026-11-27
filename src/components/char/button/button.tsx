import type { ComponentProps } from "react";
import { Button as BaseButton } from "@/components/ui/button";
const VARIANT_MAP = {
  primary: "default",
  secondary: "secondary",
  vivid: "vivid",
  info: "info",
  magenta: "magenta",
  success: "success",
  ghost: "ghost",
  danger: "danger",
  "ghost-danger": "ghost-danger",
  link: "link",
} as const;
const SIZE_MAP = {
  sm: "sm",
  md: "default",
  lg: "lg",
  icon: "icon",
} as const;
export type CharButtonVariant = keyof typeof VARIANT_MAP;
export type CharButtonSize = keyof typeof SIZE_MAP;
type BaseButtonProps = ComponentProps<typeof BaseButton>;
/**
 * Botón de acción de Char. Envuelve el primitivo de `components/ui/button`
 * pero expone la API semántica del Design System de Char (`variant`,
 * `size`) en lugar de las variantes/tokens de Shadcn, para que las pantallas
 * no queden acopladas al primitivo.
 *
 * @param variant Rol visual del botón: `primary` (acción principal, color de
 * marca), `secondary` (acción alternativa), `vivid` (azul translúcido), `info` (azul sólido y vivo —token `info`—, para las acciones de alta del encabezado de una pantalla, ej. "Nuevo cliente"), `magenta` (misma receta translúcida que `vivid`, en magenta, para acciones de creación destacadas, ej. "Agregar variantes"), `success` (verde con un poco de transparencia —token `success`, relleno al 70 %—, para confirmar o registrar algo positivo, ej. "Registrar ingreso"), `ghost` (acción de baja
 * jerarquía), `danger` (acción destructiva, rojo al 70 % de opacidad), `ghost-danger` (destructiva de baja jerarquía, ej. el ícono de eliminar en una fila) o `link` (aspecto de enlace).
 * @param size Tamaño del botón: `sm`, `md` (default), `lg` o `icon`.
 */
export function Button({
  variant = "primary",
  size = "md",
  ...props
}: Omit<BaseButtonProps, "variant" | "size"> & {
  variant?: CharButtonVariant;
  size?: CharButtonSize;
}) {
  return (
    <BaseButton
      variant={VARIANT_MAP[variant]}
      size={SIZE_MAP[size]}
      {...props}
    />
  );
}
