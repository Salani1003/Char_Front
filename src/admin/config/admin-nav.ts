import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, UserCog, Users } from "lucide-react";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** `true` para que el enlace solo esté activo con la ruta exacta. */
  end: boolean;
  /** Frase corta que explica para qué sirve la pantalla (la usa el Dashboard). */
  description: string;
}

/**
 * Pantallas del backoffice. Es la única fuente de la navegación: la usan el
 * panel lateral de `CharAdminLayout` y el buscador del header (`AdminSearch`).
 * Para agregar una pantalla al menú, agregarla acá.
 */
export const adminNavItems: AdminNavItem[] = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
    description: "Resumen de la actividad de Char.",
  },
  {
    to: "/admin/clients",
    label: "Clientes",
    icon: Users,
    end: false,
    description: "Consultá y administrá la cartera de clientes.",
  },
  {
    to: "/admin/users",
    label: "Usuarios",
    icon: UserCog,
    end: false,
    description: "Quién accede al sistema y con qué permisos.",
  },
];
