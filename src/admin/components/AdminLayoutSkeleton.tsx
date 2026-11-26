import { Skeleton } from "@/components/char/skeleton";
import { PageSkeleton } from "./PageSkeleton";

/**
 * Esqueleto del marco completo del backoffice (panel lateral, barra superior
 * y contenido) que reemplaza al layout real mientras `ProtectedRoute` valida
 * la sesión persistida. Usa las mismas medidas que `CharAdminLayout`, así al
 * terminar la validación el panel aparece en su lugar sin saltos.
 */
export function AdminLayoutSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-surface-app">
      <aside
        aria-hidden
        className="hidden w-(--sidebar-width) shrink-0 flex-col gap-8 bg-sidebar px-6 py-8 md:flex"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-14 shrink-0 rounded-full bg-sidebar-accent" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-28 bg-sidebar-accent" />
            <Skeleton className="h-3 w-24 bg-sidebar-accent" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-12 w-full bg-sidebar-accent" />
          ))}
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header
          aria-hidden
          className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-5 md:h-(--header-height)"
        >
          <Skeleton className="h-9 w-full max-w-sm" />
          <div className="flex-1" />
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="hidden h-4 w-28 sm:block" />
        </header>
        <main className="flex-1 p-5 md:p-8">
          <PageSkeleton />
        </main>
      </div>
    </div>
  );
}
