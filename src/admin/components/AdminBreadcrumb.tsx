import { useMatches } from "react-router";
import { Breadcrumb, type BreadcrumbItem } from "@/components/char/breadcrumb";
import type { AdminRouteHandle } from "../config/route-handle";

/**
 * Migas de pan del backoffice. Cada ruta declara su tramo en
 * `handle.crumb` (`app.router.tsx`, tipo `AdminRouteHandle`) y acá se juntan,
 * en orden, los de todas las rutas activas (`useMatches`), así las rutas
 * anidadas o dinámicas suman su tramo sin tocar este componente. Si hay un
 * solo tramo (el Dashboard, que ya es la raíz) no se muestra nada.
 */
export const AdminBreadcrumb = () => {
  const matches = useMatches();
  const items: BreadcrumbItem[] = matches.flatMap((match) => {
    const crumb = (match.handle as AdminRouteHandle | undefined)?.crumb;
    return crumb ? [crumb(match.loaderData)] : [];
  });
  if (items.length < 2) return null;
  return <Breadcrumb items={items} className="mb-4" />;
};
