import type { ComponentProps } from "react";
import { Badge as BaseBadge } from "@/components/ui/badge";
const VARIANT_MAP = {
  primary: "default",
  secondary: "secondary",
  success: "success",
  warning: "warning",
  danger: "danger",
  outline: "outline",
} as const;
export type CharBadgeVariant = keyof typeof VARIANT_MAP;
/**
 * Insignia de estado de Char. Envuelve el primitivo de `components/ui/badge`
 * y expone la API semántica del Design System de Char.
 *
 * @param variant Rol visual: `primary`, `secondary`, `success`, `warning`,
 * `danger` u `outline`.
 */
export function Badge({
  variant = "primary",
  ...props
}: Omit<ComponentProps<typeof BaseBadge>, "variant"> & {
  variant?: CharBadgeVariant;
}) {
  return <BaseBadge variant={VARIANT_MAP[variant]} {...props} />;
}
