import { Skeleton } from "@/components/char/skeleton";

/**
 * Esqueleto de la pantalla de edición de producto: encabezado, pestañas, las
 * tarjetas del formulario y la columna lateral. Se muestra mientras carga el
 * producto.
 */
export function ProductEditSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Cargando producto…</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <Skeleton className="h-10 w-72 max-w-full" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
