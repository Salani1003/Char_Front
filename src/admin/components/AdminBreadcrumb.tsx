import { useMatches } from "react-router";
import { Breadcrumb, type BreadcrumbItem } from "@/components/char/breadcrumb";
import type { AdminRouteHandle } from "../config/route-handle";
import { useBreadcrumbStore } from "../store/breadcrumb.store";

/**
 * Migas de pan del backoffice. Cada ruta declara su tramo en
 * `handle.crumb` (`app.router.tsx`, tipo `AdminRouteHandle`) y acá se juntan,
 * en orden, los de todas las rutas activas (`useMatches`), así las rutas
 * anidadas o dinámicas suman su tramo sin tocar este componente. Si hay un
 * solo tramo (el Dashboard, que ya es la raíz) no se muestra nada. Una
 * pantalla con datos dinámicos puede reemplazar el texto del último tramo con
 * `useBreadcrumbLabel` (ej. el nombre del producto).
 */
export const AdminBreadcrumb = () => {
  const matches = useMatches();
  const lastLabel = useBreadcrumbStore((state) => state.lastLabel);
  const crumbs: BreadcrumbItem[] = matches.flatMap((match) => {
    const crumb = (match.handle as AdminRouteHandle | undefined)?.crumb;
    return crumb ? [crumb(match.loaderData)] : [];
  });
  if (crumbs.length < 2) return null;
  const items = lastLabel
    ? crumbs.map((item, index) =>
        index === crumbs.length - 1 ? { ...item, label: lastLabel } : item,
      )
    : crumbs;
  return <Breadcrumb items={items} className="mb-4" />;
};
