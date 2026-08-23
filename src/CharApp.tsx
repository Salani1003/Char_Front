import { RouterProvider } from "react-router";
import { appRouter } from "./app.router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/char/sonner";
const queryClient = new QueryClient();
export const CharApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* The rest of your application */}
      <RouterProvider router={appRouter} />
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
