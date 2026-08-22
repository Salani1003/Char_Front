import {RouterProvider} from "react-router";
import {appRouter} from "./app.router";

export const CharApp = () => {
  return <RouterProvider router={appRouter} />;
};
