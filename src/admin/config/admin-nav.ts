import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, UserCog, Users } from "lucide-react";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** `true` para que el enlace solo esté activo con la ruta exacta. */
  end: boolean;
}

/**
 * Pantallas del backoffice. Es la única fuente de la navegación: la usan el
 * panel lateral de `CharAdminLayout` y el buscador del header (`AdminSearch`).
 * Para agregar una pantalla al menú, agregarla acá.
 */
export const adminNavItems: AdminNavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/clients", label: "Clientes", icon: Users, end: false },
  { to: "/admin/users", label: "Usuarios", icon: UserCog, end: false },
];
