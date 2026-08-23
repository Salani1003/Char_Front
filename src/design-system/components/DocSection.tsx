import type { ReactNode } from "react";
/**
 * Contenedor de sección para la página `/design-system`: título anclable
 * (para la navegación interna), descripción opcional y contenido. Compone
 * las secciones de tokens y componentes de la documentación visual.
 *
 * @param id Id usado como ancla (`#id`) por la navegación interna.
 * @param title Título de la sección.
 * @param description Texto breve debajo del título.
 */
export function DocSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-10 first:pt-0">
      <div className="mb-6 flex flex-col gap-1.5 border-b border-border pb-4">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  );
}
/**
 * Subtítulo interno usado dentro de una `DocSection` para separar grupos de
 * tokens (ej. "Cream" y "Slate" dentro de la sección Colors).
 */
export function DocSubheading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
      {children}
    </h3>
  );
}
