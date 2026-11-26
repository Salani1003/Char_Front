import { lazy } from "react";

export const AuthLayout = lazy(() => import("./auth/layouts/AuthLayout"));
export const CharAdminLayout = lazy(
  () => import("./admin/layouts/CharAdminLayout"),
);

// Pantallas: cada una en su propio chunk. Se exportan como `default` porque
// `React.lazy` lo exige; los componentes originales siguen con export nombrado.
export const LoginPage = lazy(() =>
  import("./auth/pages/login/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
export const DashboardPage = lazy(() =>
  import("./admin/pages/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
export const ClientsPage = lazy(() =>
  import("./admin/pages/clients/ClientsPage").then((m) => ({
    default: m.ClientsPage,
  })),
);
export const UsersPage = lazy(() =>
  import("./admin/pages/users/UsersPage").then((m) => ({
    default: m.UsersPage,
  })),
);
export const ProductsPage = lazy(() =>
  import("./admin/pages/products/ProductsPage").then((m) => ({
    default: m.ProductsPage,
  })),
);
export const ProductNewPage = lazy(() =>
  import("./admin/pages/products/ProductNewPage").then((m) => ({
    default: m.ProductNewPage,
  })),
);
export const ProductEditPage = lazy(() =>
  import("./admin/pages/products/ProductEditPage").then((m) => ({
    default: m.ProductEditPage,
  })),
);
export const DesignSystemPage = lazy(() =>
  import("./design-system/pages/DesignSystemPage").then((m) => ({
    default: m.DesignSystemPage,
  })),
);
