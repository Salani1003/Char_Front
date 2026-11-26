import { Skeleton } from "@/components/char/skeleton";
import { UsersListSkeleton } from "./UsersListSkeleton";

/**
 * Esqueleto genérico de una pantalla del backoffice: encabezado (título,
 * descripción y botón), barra de búsqueda y una grilla de tarjetas. Es el
 * `fallback` mientras se descarga el código de la pantalla (lazy) y parte de
 * `AdminLayoutSkeleton`, así no hay saltos entre un estado de carga y otro.
 */
export function PageSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Cargando…</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <UsersListSkeleton />
    </div>
  );
}
