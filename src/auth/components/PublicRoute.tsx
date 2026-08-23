import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/auth.store";
/**
 * Guard de rutas públicas (login, etc.). Renderiza el `Outlet` (las rutas
 * de `/auth`) solo si `useAuthStore().status !== "authenticated"`; si ya
 * hay una sesión activa redirige a `/admin` para evitar volver a mostrar
 * el login. Se usa como `element` del nodo padre de las rutas públicas en
 * `app.router.tsx`.
 */
export const PublicRoute = () => {
  const status = useAuthStore((state) => state.status);
  if (status === "authenticated") {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
};
