import { createBrowserRouter, Navigate } from "react-router";
import {
  AuthLayout,
  CharAdminLayout,
  ClientsPage,
  DashboardPage,
  DesignSystemPage,
  LoginPage,
  ProductEditPage,
  ProductNewPage,
  ProductsPage,
  UsersPage,
} from "./app.lazy";
import { ProtectedRoute } from "./auth/components/ProtectedRoute";
import { RequirePermission } from "./auth/components/RequirePermission";
import { PERMISSIONS } from "./auth/lib/permissions";
import { PublicRoute } from "./auth/components/PublicRoute";
import { navCrumb, type AdminRouteHandle } from "./admin/config/route-handle";
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
        handle: {
          crumb: () => ({ label: "Inicio", to: "/admin" }),
        } satisfies AdminRouteHandle,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            // El antiguo Catálogo se unificó con Productos.
            path: "catalog",
            element: <Navigate to="/admin/products" replace />,
          },
          {
            path: "products",
            handle: {
              crumb: navCrumb("/admin/products"),
            } satisfies AdminRouteHandle,
            children: [
              {
                index: true,
                element: (
                  <RequirePermission
                    permission={PERMISSIONS.products.product.view}
                  >
                    <RequirePermission
                      permission={PERMISSIONS.products.productVariant.view}
                    >
                      <ProductsPage />
                    </RequirePermission>
                  </RequirePermission>
                ),
              },
              {
                path: "new",
                handle: {
                  crumb: () => ({ label: "Nuevo producto" }),
                } satisfies AdminRouteHandle,
                element: (
                  <RequirePermission
                    permission={PERMISSIONS.products.product.add}
                  >
                    <ProductNewPage />
                  </RequirePermission>
                ),
              },
              {
                path: ":id",
                handle: {
                  crumb: () => ({ label: "Producto" }),
                } satisfies AdminRouteHandle,
                element: (
                  <RequirePermission
                    permission={PERMISSIONS.products.product.view}
                  >
                    <ProductEditPage />
                  </RequirePermission>
                ),
              },
            ],
          },
          {
            path: "clients",
            handle: {
              crumb: navCrumb("/admin/clients"),
            } satisfies AdminRouteHandle,
            element: (
              <RequirePermission permission={PERMISSIONS.clients.view}>
                <ClientsPage />
              </RequirePermission>
            ),
          },
          {
            path: "users",
            handle: {
              crumb: navCrumb("/admin/users"),
            } satisfies AdminRouteHandle,
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
