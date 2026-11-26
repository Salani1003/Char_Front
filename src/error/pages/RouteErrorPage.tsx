import { isRouteErrorResponse, useRouteError } from "react-router";
import { Button } from "@/components/char/button";
import { StateMessage } from "@/components/char/state-message";

/**
 * Pantalla de error de rutas (`errorElement` del router): se muestra cuando
 * una pantalla lanza un error al renderizar o cuando falla la carga de un
 * módulo lazy (por ejemplo tras un deploy). Muestra un mensaje en español y
 * dos acciones: "Recargar" (vuelve a intentar la ruta actual) y "Ir al
 * inicio". En desarrollo deja el error completo en la consola.
 */
export const RouteErrorPage = () => {
  const error = useRouteError();
  if (import.meta.env.DEV) console.error(error);

  const message = isRouteErrorResponse(error)
    ? error.status === 404
      ? "La página que buscás no existe."
      : `Ocurrió un error (${error.status}).`
    : "Algo salió mal al mostrar esta pantalla.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-app p-6">
      <StateMessage
        variant="error"
        className="w-full max-w-md"
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Recargar
            </Button>
            <Button onClick={() => window.location.assign("/admin")}>
              Ir al inicio
            </Button>
          </div>
        }
      >
        {message}
      </StateMessage>
    </div>
  );
};
