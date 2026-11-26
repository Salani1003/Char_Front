import type { ComponentProps, ReactNode } from "react";
import { CircleAlert, Inbox, LoaderCircle } from "lucide-react";
import { Card } from "@/components/char/card";
import { cn } from "@/lib/utils";

const VARIANTS = {
  loading: {
    icon: LoaderCircle,
    iconClass: "animate-spin text-muted-foreground",
    textClass: "text-muted-foreground",
    role: "status",
  },
  empty: {
    icon: Inbox,
    iconClass: "text-muted-foreground",
    textClass: "text-muted-foreground",
    role: undefined,
  },
  error: {
    icon: CircleAlert,
    iconClass: "text-danger",
    textClass: "text-danger",
    role: "alert",
  },
} as const;

export type CharStateMessageVariant = keyof typeof VARIANTS;

/**
 * Mensaje de estado de un listado de Char: tarjeta centrada con ícono y texto
 * para los tres estados que toda lista debería cubrir — `loading` (cargando,
 * con ícono girando), `empty` (sin resultados) y `error` (falló la request,
 * con el mensaje del backend). El rol ARIA acompaña al estado (`status` en
 * carga, `alert` en error).
 *
 * @param variant Estado que se muestra: `loading`, `empty` o `error`.
 * @param children Texto del mensaje.
 * @param action Control opcional bajo el texto (ej. un botón "Reintentar").
 */
export function StateMessage({
  variant,
  children,
  action,
  className,
  ...props
}: Omit<ComponentProps<typeof Card>, "children"> & {
  variant: CharStateMessageVariant;
  children: ReactNode;
  action?: ReactNode;
}) {
  const { icon: Icon, iconClass, textClass, role } = VARIANTS[variant];

  return (
    <Card
      data-slot="state-message"
      role={role}
      className={cn("items-center gap-3 px-6 py-10 text-center", className)}
      {...props}
    >
      <Icon className={cn("size-6", iconClass)} aria-hidden />
      <p className={cn("text-sm", textClass)}>{children}</p>
      {action}
    </Card>
  );
}
