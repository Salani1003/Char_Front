import type { ComponentProps, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  info: { icon: Info, className: "bg-info/10 text-info", role: "status" },
  success: {
    icon: CircleCheck,
    className: "bg-success/12 text-success",
    role: "status",
  },
  warning: {
    icon: TriangleAlert,
    className: "bg-warning/14 text-warning",
    role: "status",
  },
  danger: {
    icon: CircleAlert,
    className: "bg-danger/12 text-danger",
    role: "alert",
  },
} as const;

export type CharNoticeVariant = keyof typeof VARIANTS;

/**
 * Aviso en línea de Char: franja con ícono y texto para informar algo dentro
 * de una pantalla o sección (ej. "Este producto está publicado…"), sin ocupar
 * el lugar de un estado de lista (para eso `StateMessage`) ni bloquear
 * (para eso `AlertDialog`). Usa los colores de rol; el rol ARIA acompaña a la
 * variante (`alert` en `danger`, `status` en el resto).
 *
 * @param variant Rol visual: `info` (por defecto), `success`, `warning` o `danger`.
 * @param title Título opcional en negrita.
 * @param children Texto del aviso.
 */
export function Notice({
  variant = "info",
  title,
  children,
  className,
  ...props
}: Omit<ComponentProps<"div">, "title"> & {
  variant?: CharNoticeVariant;
  title?: ReactNode;
}) {
  const { icon: Icon, className: tone, role } = VARIANTS[variant];
  return (
    <div
      data-slot="notice"
      role={role}
      className={cn(
        "flex items-start gap-3 rounded-card p-4 text-sm",
        tone,
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-col gap-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  );
}
