import { Outlet, useNavigate } from "react-router";
import { AlertDialog } from "@/components/char/alert-dialog";
import { useCan } from "../lib/permissions";

/**
 * Guarda de rutas por permiso. Si el usuario tiene `permission` (según `can`)
 * renderiza `children` (o el `Outlet`); si no, no monta la pantalla — así no
 * se hacen requests — y muestra una alerta "Usted no posee permisos" que, al
 * aceptar o cerrarse, redirige a la home del panel (`/admin`). Usar el permiso
 * de "ver" del módulo. Como reacciona al store, también actúa si los permisos
 * se revocan con la sesión abierta.
 *
 * @param permission Permiso requerido (ej. `PERMISSIONS.clients.view`).
 * @param children Pantalla protegida; si se omite se renderiza el `Outlet`.
 */
export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children?: React.ReactNode;
}) {
  const can = useCan();
  const navigate = useNavigate();

  if (can(permission)) return children ?? <Outlet />;

  return (
    <AlertDialog
      open
      onOpenChange={() => void navigate("/admin", { replace: true })}
      variant="warning"
      title="Usted no posee permisos"
      description="No tenés permiso para acceder a esta sección."
    />
  );
}
