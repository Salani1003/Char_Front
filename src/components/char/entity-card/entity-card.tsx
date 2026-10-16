import type { ComponentProps, ReactNode } from "react";
import { Card } from "@/components/char/card";
import { cn } from "@/lib/utils";

export interface EntityCardDetail {
  /** Ícono opcional mostrado antes de la etiqueta. */
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}

/** Iniciales (máx. 2) de un nombre: "María Pérez" → "MP". */
function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/**
 * Tarjeta genérica para mostrar un registro (usuario, cliente, ...) en un
 * listado: avatar con iniciales, título, subtítulo, un badge de estado
 * opcional, una lista de datos etiquetados y acciones opcionales al pie. No
 * conoce ningún recurso concreto — cada dominio la alimenta con sus datos
 * (ver `admin/components/UserCard`). Mobile-first: ocupa el ancho de su
 * contenedor y los textos largos se truncan.
 *
 * @param title Nombre principal del registro.
 * @param subtitle Texto secundario bajo el título (ej. email).
 * @param avatar Contenido del avatar; por defecto las iniciales de `title`.
 * @param badge Elemento de estado a la derecha del título (ej. `Badge`).
 * @param details Datos etiquetados (`icon`, `label`, `value`).
 * @param actions Botones del pie de la tarjeta.
 */
export function EntityCard({
  title,
  subtitle,
  avatar,
  badge,
  details,
  actions,
  className,
  ...props
}: Omit<ComponentProps<typeof Card>, "title" | "children"> & {
  title: string;
  subtitle?: ReactNode;
  avatar?: ReactNode;
  badge?: ReactNode;
  details?: EntityCardDetail[];
  actions?: ReactNode;
}) {
  return (
    <Card
      data-slot="entity-card"
      className={cn("gap-4 px-(--card-spacing)", className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-accent-foreground"
        >
          {avatar ?? getInitials(title)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm leading-tight font-semibold text-foreground">
            {title}
          </h3>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
      {details?.length ? (
        <dl className="flex flex-col gap-2 border-t border-border pt-3 text-xs">
          {details.map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              {icon ? (
                <span className="shrink-0 text-muted-foreground [&>svg]:size-3.5">
                  {icon}
                </span>
              ) : null}
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="ml-auto min-w-0 truncate text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {actions ? (
        <div className="flex items-center justify-end gap-2">{actions}</div>
      ) : null}
    </Card>
  );
}
