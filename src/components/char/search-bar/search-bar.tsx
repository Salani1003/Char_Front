import type { ComponentProps, ReactNode } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/char/card";
import { Input } from "@/components/char/input";
import { cn } from "@/lib/utils";

/**
 * Barra de búsqueda y filtros de Char: una tarjeta con un encabezado
 * ("Filtros" por defecto) y un campo de búsqueda con ícono de lupa. Es
 * genérica: no conoce el recurso que filtra. Controlada — el estado del texto
 * vive en la pantalla. Mobile-first: el campo y los filtros extra se apilan y
 * desde `sm` quedan en una misma fila.
 *
 * @param value Texto actual de la búsqueda.
 * @param onValueChange Se llama con el nuevo texto en cada cambio.
 * @param placeholder Texto de ayuda del campo.
 * @param title Título del encabezado; por defecto "Filtros".
 * @param children Controles de filtro adicionales (ej. selects) mostrados a
 * la derecha del campo.
 */
export function SearchBar({
  value,
  onValueChange,
  placeholder = "Buscar…",
  title = "Filtros",
  children,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children" | "title" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  children?: ReactNode;
}) {
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
        {children}
      </div>
    </Card>
  );
}
