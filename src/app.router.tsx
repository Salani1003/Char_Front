import { createBrowserRouter, Navigate } from "react-router";
import { DashboardPage } from "./admin/pages/dashboard/DashboardPage";
import { ClientsPage } from "./admin/pages/clients/ClientsPage";
import { LoginPage } from "./auth/pages/login/LoginPage";
import { AuthLayout, CharAdminLayout } from "./app.lazy";
import { ProtectedRoute } from "./auth/components/ProtectedRoute";
import { PublicRoute } from "./auth/components/PublicRoute";
import { UsersPage } from "./admin/pages/users/UsersPage";
import { DesignSystemPage } from "./design-system/pages/DesignSystemPage";
export const appRouter = createBrowserRouter([
  //Admin routes
  {
    path: "/admin",
    element: <ProtectedRoute />,
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
            element: <ClientsPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
        ],
      },
    ],
  },
  // Documentación visual e interactiva del Design System de Char
  {
    path: "/design-system",
    element: <DesignSystemPage />,
  },
  // redirije cualquier ruta que no exista a /admin
  {
    path: "*",
    element: <Navigate to="/admin" />,
  },
  // Auth routes
  {
    path: "/auth",
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/auth/login" />,
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
