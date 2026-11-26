import { useLocation } from "react-router";
import { Breadcrumb, type BreadcrumbItem } from "@/components/char/breadcrumb";
import { adminNavItems } from "../config/admin-nav";

/**
 * Migas de pan del backoffice. Se derivan de la ruta actual y de
 * `adminNavItems` (misma fuente que el menú lateral): "Inicio" (`/admin`)
 * seguido del módulo activo. En el Dashboard no se muestra nada (ya es la
 * raíz). Si una pantalla suma rutas anidadas, se agregan como tramos
 * adicionales a partir del módulo.
 */
export const AdminBreadcrumb = () => {
  const { pathname } = useLocation();
  const current = adminNavItems.find(
    (item) => item.to !== "/admin" && pathname.startsWith(item.to),
  );
  if (!current) return null;
  const items: BreadcrumbItem[] = [
    { label: "Inicio", to: "/admin" },
    { label: current.label, to: current.to },
  ];
  return <Breadcrumb items={items} className="mb-4" />;
};
