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
export const InventoryPage = lazy(() =>
  import("./admin/pages/inventory/InventoryPage").then((m) => ({
    default: m.InventoryPage,
  })),
);
export const StockMovementNewPage = lazy(() =>
  import("./admin/pages/inventory/StockMovementNewPage").then((m) => ({
    default: m.StockMovementNewPage,
  })),
);
export const StockCountNewPage = lazy(() =>
  import("./admin/pages/inventory/StockCountNewPage").then((m) => ({
    default: m.StockCountNewPage,
  })),
);
export const StockCountPage = lazy(() =>
  import("./admin/pages/inventory/StockCountPage").then((m) => ({
    default: m.StockCountPage,
  })),
);
export const StockOperationPage = lazy(() =>
  import("./admin/pages/inventory/StockOperationPage").then((m) => ({
    default: m.StockOperationPage,
  })),
);
export const SalesPage = lazy(() =>
  import("./admin/pages/sales/SalesPage").then((m) => ({
    default: m.SalesPage,
  })),
);
export const ExchangeNewPage = lazy(() =>
  import("./admin/pages/sales/ExchangeNewPage").then((m) => ({
    default: m.ExchangeNewPage,
  })),
);
export const ExchangePage = lazy(() =>
  import("./admin/pages/sales/ExchangePage").then((m) => ({
    default: m.ExchangePage,
  })),
);
export const SaleNewPage = lazy(() =>
  import("./admin/pages/sales/SaleNewPage").then((m) => ({
    default: m.SaleNewPage,
  })),
);
export const SalePage = lazy(() =>
  import("./admin/pages/sales/SalePage").then((m) => ({
    default: m.SalePage,
  })),
);
export const DesignSystemPage = lazy(() =>
  import("./design-system/pages/DesignSystemPage").then((m) => ({
    default: m.DesignSystemPage,
  })),
);
