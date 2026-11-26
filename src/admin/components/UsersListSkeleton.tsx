import { Skeleton } from "@/components/char/skeleton";

/**
 * Esqueleto de una grilla de tarjetas de entidad (usuarios, clientes, ...)
 * con la misma grilla responsive que el listado real: se muestra mientras
 * llega la primera página para que el contenido no salte al cargar.
 *
 * @param count Cantidad de tarjetas; por defecto 6.
 */
export function UsersListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
