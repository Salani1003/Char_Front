import type { ComponentProps, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Card } from "@/components/char/card";
import { Input } from "@/components/char/input";
import { cn } from "@/lib/utils";

/**
 * Barra de búsqueda de Char y único buscador del sistema: una sola fila con un
 * campo de búsqueda con ícono de lupa (sin encabezado: el placeholder ya dice
 * qué se busca). Es genérica: no conoce el recurso que filtra. Controlada — el estado del
 * texto vive en la pantalla. Con texto escrito aparece un botón para limpiarlo
 * (Escape hace lo mismo).
 *
 * Los filtros no se arman acá: se pasan en `actions` como un `FiltersPopover`
 * (`components/char/filters-popover`), que queda a la derecha del campo.
 * Mobile-first: `actions` baja debajo del campo y desde `sm` todo queda en fila.
 *
 * @param value Texto actual de la búsqueda.
 * @param onValueChange Se llama con el nuevo texto en cada cambio.
 * @param placeholder Texto de ayuda del campo.
 * @param actions Controles a la derecha del campo; en la práctica, el
 * `FiltersPopover` de la pantalla. Opcional.
 */
export function SearchBar({
  value,
  onValueChange,
  placeholder = "Buscar…",
  actions,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  actions?: ReactNode;
}) {
  return (
    <Card data-slot="search-bar" className={cn("py-3", className)} {...props}>
      <div className="flex flex-col gap-3 px-(--card-spacing) sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Input
            type="search"
            icon={<Search className="size-4" aria-hidden />}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && value) {
                e.preventDefault();
                onValueChange("");
              }
            }}
            placeholder={placeholder}
            aria-label={placeholder}
            className="pr-8 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {value ? (
            <button
              type="button"
              onClick={() => onValueChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute top-1/2 right-1.5 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
        {actions}
      </div>
    </Card>
  );
}
