import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { AdminLayoutSkeleton } from "@/admin/components/AdminLayoutSkeleton";
import { useAuthStore } from "../store/auth.store";
/**
 * Guard de rutas privadas. Si `useAuthStore().status` no es
 * `"authenticated"` redirige a `/auth/login`. Si hay una sesión persistida
 * que todavía no se validó en esta carga de la página (`sessionVerified`),
 * la valida con `verifySession` y mientras tanto muestra el esqueleto del
 * panel (`AdminLayoutSkeleton`) — así una sesión con tokens vencidos o revocados no deja entrar al
 * panel. Recién con la sesión validada renderiza el `Outlet` (las rutas de
 * `/admin`). Se usa como `element` del nodo padre de las rutas protegidas en
 * `app.router.tsx`. También renueva el usuario (`refreshUser`, o sea sus
 * permisos) cada vez que la pestaña vuelve a estar visible.
 */
export const ProtectedRoute = () => {
  const status = useAuthStore((state) => state.status);
  const sessionVerified = useAuthStore((state) => state.sessionVerified);
  const verifySession = useAuthStore((state) => state.verifySession);
  useEffect(() => {
    if (status === "authenticated" && !sessionVerified) void verifySession();
  }, [status, sessionVerified, verifySession]);
  // Los permisos pueden cambiar con la sesión abierta: al volver a la pestaña
  // se vuelven a pedir.
  const refreshUser = useAuthStore((state) => state.refreshUser);
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshUser();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshUser]);
  if (status !== "authenticated") {
    return <Navigate to="/auth/login" replace />;
  }
  if (!sessionVerified) {
    return <AdminLayoutSkeleton />;
  }
  return <Outlet />;
};
