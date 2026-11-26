import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Encabezado de página de Char: título, descripción opcional y acciones
 * opcionales (típicamente `Button`s). Mobile-first: en pantallas chicas las
 * acciones van debajo del texto y ocupan el ancho disponible; desde `sm` se
 * alinean a la derecha, a la altura del título.
 *
 * @param title Título de la página (se renderiza como `h1`).
 * @param description Texto breve que explica la página.
 * @param actions Botones u otros controles alineados a la derecha. Para
 * acciones solo con ícono usar `PageHeaderAction`.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: Omit<ComponentProps<"header">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "animate-rise flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="font-display text-3xl leading-tight font-medium tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-prose text-sm text-muted-foreground md:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div
          data-slot="page-header-actions"
          className="flex shrink-0 flex-wrap items-center gap-2 max-sm:justify-end max-sm:[&>:not([data-slot=page-header-action])]:flex-1 sm:pt-1"
        >
          {actions}
        </div>
      ) : null}
    </header>
  );
}
