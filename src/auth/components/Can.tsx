import type { ReactNode } from "react";
import { useCan } from "../lib/permissions";

/**
 * Guarda de UI: renderiza `children` solo si el usuario autenticado tiene
 * `permission` (según `can`: superusuario o permiso en su lista); si no,
 * renderiza `fallback` (nada por defecto). Sirve para mostrar u ocultar
 * botones y secciones.
 *
 * @param permission Permiso `<app>.<accion>_<modelo>` (ver `PERMISSIONS`).
 * @param children Contenido visible con permiso.
 * @param fallback Contenido alternativo sin permiso.
 */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const can = useCan();
  return can(permission) ? children : fallback;
}
