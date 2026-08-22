import {lazy} from "react";

export const AuthLayout = lazy(() => import("./auth/layouts/AuthLayout"));
export const CharAdminLayout = lazy(
  () => import("./admin/layouts/CharAdminLayout"),
);
