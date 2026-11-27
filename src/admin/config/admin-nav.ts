import type { LucideIcon } from "lucide-react";
import { PERMISSIONS } from "@/auth/lib/permissions";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  UserCog,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** `true` para que el enlace solo esté activo con la ruta exacta. */
  end: boolean;
  /** Frase corta que explica para qué sirve la pantalla (la usa el Dashboard). */
  description: string;
  /** Permiso de "ver" del módulo; sin él no aparece en el menú. Sin permiso = siempre visible. */
  permission?: string;
}

/**
 * Pantallas del backoffice. Es la única fuente de la navegación: la usan el
 * panel lateral de `CharAdminLayout` y el buscador del header (`AdminSearch`).
 * Cada módulo declara su permiso de "ver" (`permission`) y solo se muestra a
 * quien lo tiene (`can`). Para agregar una pantalla al menú, agregarla acá.
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
    to: "/admin/users",
    label: "Usuarios",
    icon: UserCog,
    end: false,
    description: "Quién accede al sistema y con qué permisos.",
    permission: PERMISSIONS.users.view,
  },
  {
    to: "/admin/clients",
    label: "Clientes",
    icon: Users,
    end: false,
    description: "Consultá y administrá la cartera de clientes.",
    permission: PERMISSIONS.clients.view,
  },
  {
    to: "/admin/products",
    label: "Productos",
    icon: Package,
    end: false,
    description:
      "Explorá las variantes, sus precios y administrá los productos.",
    permission: PERMISSIONS.products.product.view,
  },
  {
    to: "/admin/inventory",
    label: "Inventario",
    icon: Warehouse,
    end: false,
    description: "Consultá el stock de cada variante y su estado.",
    permission: PERMISSIONS.stock.level.view,
  },
];
