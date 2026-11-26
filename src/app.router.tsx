import { createBrowserRouter, Navigate } from "react-router";
import {
  AuthLayout,
  CharAdminLayout,
  ClientsPage,
  DashboardPage,
  DesignSystemPage,
  LoginPage,
  UsersPage,
} from "./app.lazy";
import { ProtectedRoute } from "./auth/components/ProtectedRoute";
import { RequirePermission } from "./auth/components/RequirePermission";
import { PERMISSIONS } from "./auth/lib/permissions";
import { PublicRoute } from "./auth/components/PublicRoute";
import { RouteErrorPage } from "./error/pages/RouteErrorPage";
export const appRouter = createBrowserRouter([
  //Admin routes
  {
    path: "/admin",
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <CharAdminLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "clients",
            element: (
              <RequirePermission permission={PERMISSIONS.clients.view}>
                <ClientsPage />
              </RequirePermission>
            ),
          },
          {
            path: "users",
            element: (
              <RequirePermission permission={PERMISSIONS.users.view}>
                <UsersPage />
              </RequirePermission>
            ),
          },
        ],
      },
    ],
  },
  // Documentación visual e interactiva del Design System de Char
  {
    path: "/design-system",
    element: <DesignSystemPage />,
    errorElement: <RouteErrorPage />,
  },
  // redirije cualquier ruta que no exista a /admin
  {
    path: "*",
    element: <Navigate to="/admin" replace />,
  },
  // Auth routes
  {
    path: "/auth",
    element: <PublicRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/auth/login" replace />,
          },
          {
            path: "login",
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
]);
