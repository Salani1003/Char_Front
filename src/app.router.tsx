import {createBrowserRouter, Navigate} from "react-router";
import {DashboardPage} from "./admin/pages/dashboard/DashboardPage";
import {ClientsPage} from "./admin/pages/clients/ClientsPage";
import {LoginPage} from "./auth/pages/login/LoginPage";
import {AuthLayout, CharAdminLayout} from "./app.lazy";
import {UsersPage} from "./admin/pages/users/UsersPage";

export const appRouter = createBrowserRouter([
  //Admin routes
  {
    path: "/admin",
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
  // redirije cualquier ruta que no exista a /admin
  {
    path: "*",
    element: <Navigate to="/admin" />,
  },
  // Auth routes
  {
    path: "/auth",
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
]);
