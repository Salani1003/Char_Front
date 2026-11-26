import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/char/skeleton";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  /**
   * Identifica la columna. Si es `sortable`, también es el valor que se
   * informa en `onOrderingChange` (ej. el campo de la API: `last_name`).
   */
  key: string;
  /** Texto del encabezado. */
  header: string;
  /** Contenido de la celda para una fila. */
  cell: (row: T) => ReactNode;
  /** Permite ordenar al hacer clic en el encabezado. */
  sortable?: boolean;
  /** Alineación del contenido; por defecto a la izquierda. */
  align?: "left" | "right";
  /** Oculta visualmente el encabezado (queda para lectores de pantalla). */
  hideHeader?: boolean;
  /** Clases extra para el `th` y las celdas (ej. ancho). */
  className?: string;
}

/** Interpreta `ordering` (`campo` asc, `-campo` desc) para una columna. */
const getSortState = (ordering: string | undefined, key: string) => {
  if (ordering === key) return "ascending" as const;
  if (ordering === `-${key}`) return "descending" as const;
  return "none" as const;
};

/**
 * Tabla de datos de Char para listados: encabezado con columnas ordenables,
 * filas con el contenido que define cada columna, esqueleto de carga que
 * conserva el encabezado y desplazamiento horizontal cuando no entra (el
 * contenido nunca se comprime por debajo de `--table-min-width`). Es genérica:
 * no conoce el recurso, cada pantalla describe sus `columns`.
 *
 * El orden es controlado y usa la convención de DRF: `ordering="last_name"` es
 * ascendente y `"-last_name"` descendente. Un clic en un encabezado ordenable
 * pide ascendente si la columna no estaba ordenada y alterna asc/desc si ya lo
 * estaba (`aria-sort` informa el estado). Los estados vacío y de error no son
 * de la tabla: se resuelven fuera con `StateMessage`.
 *
 * @param columns Definición de las columnas (`key`, `header`, `cell`, ...).
 * @param rows Filas a mostrar.
 * @param getRowKey Devuelve la clave única de una fila (ej. su `id`).
 * @param caption Descripción de la tabla para lectores de pantalla.
 * @param ordering Orden actual (`campo` o `-campo`).
 * @param onOrderingChange Se llama con el nuevo orden al hacer clic en un
 * encabezado ordenable.
 * @param loading Muestra filas de esqueleto en lugar de `rows`.
 * @param skeletonRows Cantidad de filas de esqueleto; por defecto 8.
 * @param dimmed Atenúa las filas (ej. mientras se muestra la página anterior).
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  ordering,
  onOrderingChange,
  loading = false,
  skeletonRows = 8,
  dimmed = false,
  className,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  caption: string;
  ordering?: string;
  onOrderingChange?: (ordering: string) => void;
  loading?: boolean;
  skeletonRows?: number;
  dimmed?: boolean;
  className?: string;
}) {
  const toggleSort = (key: string) => {
    onOrderingChange?.(ordering === key ? `-${key}` : key);
  };

  return (
    <div
      data-slot="data-table"
      className={cn(
        "relative overflow-x-auto rounded-card bg-card ring-1 ring-foreground/10",
        className,
      )}
    >
      <table
        aria-busy={loading || undefined}
        className="w-full min-w-(--table-min-width) border-collapse text-sm"
      >
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border bg-surface-app">
            {columns.map((column) => {
              const sort = column.sortable
                ? getSortState(ordering, column.key)
                : undefined;
              const SortIcon =
                sort === "ascending"
                  ? ArrowUp
                  : sort === "descending"
                    ? ArrowDown
                    : ChevronsUpDown;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={sort}
                  className={cn(
                    "px-(--pad-table-cell-x) py-3 font-semibold text-muted-foreground",
                    column.align === "right" ? "text-right" : "text-left",
                    column.className,
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        "-mx-1.5 inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 font-semibold transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                        sort !== "none" && "text-foreground",
                      )}
                    >
                      {column.header}
                      <SortIcon
                        aria-hidden
                        className={cn(
                          "size-3.5",
                          sort === "none" && "opacity-50",
                        )}
                      />
                    </button>
                  ) : (
                    <span className={cn(column.hideHeader && "sr-only")}>
                      {column.header}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody
          className={cn(
            "transition-opacity",
            dimmed && !loading && "opacity-60",
          )}
        >
          {loading
            ? Array.from({ length: skeletonRows }, (_, index) => (
                <tr
                  key={index}
                  aria-hidden
                  className="border-b border-border-soft last:border-b-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-(--pad-table-cell-x) py-(--pad-table-cell-y)"
                    >
                      <Skeleton
                        className={cn(
                          "h-4",
                          column.hideHeader ? "ml-auto size-7" : "w-3/4",
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="border-b border-border-soft transition-colors last:border-b-0 hover:bg-surface-app"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-(--pad-table-cell-x) py-(--pad-table-cell-y) text-foreground",
                        column.align === "right" && "text-right",
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
