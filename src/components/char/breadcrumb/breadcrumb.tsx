import { Fragment, type ComponentProps } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  /** Texto del tramo. */
  label: string;
  /** Destino del enlace; sin `to` el tramo se muestra como texto (el último es la página actual). */
  to?: string;
}

/**
 * Migas de pan de Char: muestra la ubicación del usuario como una lista de
 * tramos separados por un chevron. Los tramos con `to` son enlaces; el último
 * tramo es la página actual (texto, `aria-current="page"`). En pantallas
 * chicas los textos largos se truncan para no desbordar.
 *
 * @param items Tramos en orden, del más general al más específico.
 */
export function Breadcrumb({
  items,
  className,
  ...props
}: Omit<ComponentProps<"nav">, "children"> & { items: BreadcrumbItem[] }) {
  return (
    <nav
      data-slot="breadcrumb"
      aria-label="Migas de pan"
      className={cn("min-w-0", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.to ?? item.label}-${index}`}>
              <li className="flex min-w-0 items-center">
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="truncate transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn("truncate", isLast && "text-foreground")}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {isLast ? null : (
                <li aria-hidden className="flex shrink-0 items-center">
                  <ChevronRight className="size-3.5" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
