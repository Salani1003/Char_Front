import { useId, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/char/button";
import { Card } from "@/components/char/card";
import { Input } from "@/components/char/input";
import { cn } from "@/lib/utils";

/**
 * Barra de búsqueda y filtros de Char: una tarjeta con un encabezado
 * ("Filtros" por defecto) y un campo de búsqueda con ícono de lupa. Es
 * genérica: no conoce el recurso que filtra. Controlada — el estado del texto
 * vive en la pantalla.
 *
 * Si se pasa `filters`, aparece un botón ("Más filtros") a la derecha del
 * campo que despliega/oculta esa sección bajo el buscador (arranca plegada).
 * Mobile-first: el botón baja debajo del campo y los controles de `filters`
 * se apilan; desde `sm` todo queda en fila.
 *
 * @param value Texto actual de la búsqueda.
 * @param onValueChange Se llama con el nuevo texto en cada cambio.
 * @param placeholder Texto de ayuda del campo.
 * @param title Título del encabezado; por defecto "Filtros".
 * @param filters Controles de filtro (ej. selects) de la sección desplegable.
 * Opcional: sin ella no se muestra el botón.
 * @param filtersLabel Texto del botón que despliega `filters`; por defecto
 * "Más filtros".
 */
export function SearchBar({
  value,
  onValueChange,
  placeholder = "Buscar…",
  title = "Filtros",
  filters,
  filtersLabel = "Más filtros",
  className,
  ...props
}: Omit<ComponentProps<"div">, "children" | "title" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  filters?: ReactNode;
  filtersLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <Card data-slot="search-bar" className={cn("gap-4", className)} {...props}>
      <div className="flex items-center gap-3 px-(--card-spacing)">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <SlidersHorizontal className="size-4" aria-hidden />
        </span>
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 px-(--card-spacing) sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Input
            type="search"
            icon={<Search className="size-4" aria-hidden />}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
          />
        </div>
        {filters ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls={panelId}
          >
            {filtersLabel}
            <ChevronDown
              aria-hidden
              className={cn("transition-transform", open && "rotate-180")}
            />
          </Button>
        ) : null}
      </div>
      {filters ? (
        <div
          id={panelId}
          inert={!open}
          className={cn(
            "-mt-4 grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-3 px-(--card-spacing) pt-4 sm:flex-row sm:flex-wrap sm:items-end">
              {filters}
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
