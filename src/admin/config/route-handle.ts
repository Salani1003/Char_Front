import type { BreadcrumbItem } from "@/components/char/breadcrumb";
import { adminNavItems } from "./admin-nav";

/**
 * Forma del `handle` de las rutas del backoffice. `crumb` declara el tramo de
 * migas de pan que aporta la ruta; recibe los datos del `loader` de esa ruta
 * (si tiene) para poder armar labels dinámicos (ej. el nombre de un cliente).
 */
export interface AdminRouteHandle {
  crumb?: (data: unknown) => BreadcrumbItem;
}

/**
 * Tramo de migas para un módulo del menú: toma el label de `adminNavItems`
 * (así el texto no se duplica entre menú y migas).
 *
 * @param to `to` del módulo en `adminNavItems` (ej. `/admin/users`).
 */
export const navCrumb =
  (to: string): NonNullable<AdminRouteHandle["crumb"]> =>
  () => {
    const item = adminNavItems.find((navItem) => navItem.to === to);
    return { label: item?.label ?? to, to };
  };
