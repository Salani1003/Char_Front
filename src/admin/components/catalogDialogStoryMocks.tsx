import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError, type AxiosAdapter, type AxiosResponse } from "axios";
import { Button } from "@/components/char/button";
import { charApi } from "@/lib/charApi";

/** Respuesta simulada de la API para una story: éxito, 400 o "cargando" sin fin. */
export type MockReply =
  | { kind: "ok"; status?: number; data: unknown }
  | { kind: "error"; status: number; data: unknown }
  | { kind: "pending" };

const buildResponse = (
  config: Parameters<AxiosAdapter>[0],
  status: number,
  data: unknown,
): AxiosResponse => ({
  data,
  status,
  statusText: String(status),
  headers: {},
  config,
});

/**
 * Envoltorio SOLO para Storybook: provee un `QueryClient` propio y reemplaza el
 * adaptador de `charApi` por uno que contesta con `reply(method, url)`, así
 * los estados (error de campo, nombre repetido, cargando) se ven sin backend.
 *
 * @param reply Respuesta simulada según método y URL (ej. `POST /brands/`).
 * @param children Contenido que usa la API simulada.
 */
export function ApiMockProvider({
  reply,
  children,
}: {
  reply: (method: string, url: string) => MockReply;
  children: ReactNode;
}) {
  const [client] = useState(() => new QueryClient());

  useEffect(() => {
    const previous = charApi.defaults.adapter;
    charApi.defaults.adapter = (config) => {
      const result = reply(
        (config.method ?? "get").toLowerCase(),
        config.url ?? "",
      );
      if (result.kind === "pending") return new Promise(() => {});
      const response = buildResponse(
        config,
        result.kind === "ok" ? (result.status ?? 200) : result.status,
        result.data,
      );
      if (result.kind === "ok") return Promise.resolve(response);
      return Promise.reject(
        new AxiosError(
          "Request failed",
          "ERR_BAD_REQUEST",
          config,
          undefined,
          response,
        ),
      );
    };
    return () => {
      charApi.defaults.adapter = previous;
    };
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/**
 * Envoltorio SOLO para Storybook de los modales de alta: usa `ApiMockProvider`
 * e incluye un botón que abre el modal y le pasa `open`/`onOpenChange`/
 * `onCreated`; el último registro entregado a `onCreated` se muestra debajo.
 *
 * @param reply Respuesta simulada según método y URL (ej. `POST /brands/`).
 * @param children Render del modal recibiendo `open`, `onOpenChange` y `onCreated`.
 */
export function CatalogDialogStoryFrame({
  reply,
  children,
}: {
  reply: (method: string, url: string) => MockReply;
  children: (args: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (record: unknown) => void;
  }) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<unknown>(null);
  return (
    <ApiMockProvider reply={reply}>
      <div className="flex flex-col items-start gap-3">
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
        {created ? (
          <pre className="text-xs text-muted-foreground">
            onCreated: {JSON.stringify(created)}
          </pre>
        ) : null}
      </div>
      {children({ open, onOpenChange: setOpen, onCreated: setCreated })}
    </ApiMockProvider>
  );
}
