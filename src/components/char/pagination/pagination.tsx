import { useId } from "react";
import type { ComponentProps } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/char/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * Paginación de Char para listados: muestra el total de resultados, un
 * selector de cantidad por página, "Página X de Y" y los botones anterior /
 * siguiente. Es controlada: la pantalla guarda `page` y `pageSize` y debe
 * volver a la página 1 cuando cambia la búsqueda, un filtro o `pageSize`.
 *
 * Los textos van en `text-foreground` y peso medio para que se lean bien
 * sobre el fondo de la app. Mobile-first: los controles pasan a una segunda línea cuando no entran.
 *
 * @param page Página actual (empieza en 1).
 * @param pageSize Cantidad de resultados por página.
 * @param total Cantidad total de resultados (el `count` de la API).
 * @param onPageChange Se llama con la nueva página.
 * @param onPageSizeChange Se llama con el nuevo tamaño de página.
 * @param itemLabel Singular/plural del recurso listado (ej. usuario /
 * usuarios); por defecto "resultado" / "resultados".
 * @param pageSizeOptions Tamaños elegibles; por defecto 10, 20, 50 y 100.
 * @param disabled Deshabilita los controles (ej. mientras se carga otra página).
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  itemLabel = { singular: "resultado", plural: "resultados" },
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  disabled = false,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemLabel?: { singular: string; plural: string };
  pageSizeOptions?: number[];
  disabled?: boolean;
}) {
  const pageSizeLabelId = useId();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const sizeItems = Object.fromEntries(
    pageSizeOptions.map((option) => [String(option), String(option)]),
  );

  return (
    <div
      data-slot="pagination"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-foreground",
        className,
      )}
      {...props}
    >
      <span>
        {total} {total === 1 ? itemLabel.singular : itemLabel.plural}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span id={pageSizeLabelId}>Mostrar</span>
          <Select
            items={sizeItems}
            value={String(pageSize)}
            disabled={disabled}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger
              size="sm"
              className="w-20"
              aria-labelledby={pageSizeLabelId}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span>
          Página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Página anterior"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Página siguiente"
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
