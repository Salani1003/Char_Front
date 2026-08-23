import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/auth.store";
/**
 * Guard de rutas privadas. Renderiza el `Outlet` (las rutas de `/admin`)
 * solo si `useAuthStore().status === "authenticated"`; en caso contrario
 * redirige a `/auth/login`. Se usa como `element` del nodo padre de las
 * rutas protegidas en `app.router.tsx`.
 */
export const ProtectedRoute = () => {
  const status = useAuthStore((state) => state.status);
  if (status !== "authenticated") {
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
};
