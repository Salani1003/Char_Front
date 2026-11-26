import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

/**
 * Reintenta solo los fallos que pueden ser pasajeros: errores de red y 5xx,
 * hasta 2 veces. Un 4xx (404, 403, 400, ...) no mejora al repetirlo, así que
 * falla enseguida y la pantalla muestra el error sin esperar los reintentos.
 * (Un 401 ya lo resuelve el interceptor de `charApi`.)
 */
const shouldRetry = (failureCount: number, error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response &&
    error.response.status < 500
  ) {
    return false;
  }
  return failureCount < 2;
};

/**
 * `QueryClient` compartido de la app. Defaults: sin reintentos para 4xx (ver
 * `shouldRetry`) y `staleTime` de 30 s para no volver a pedir al instante lo
 * que se acaba de traer al navegar entre pantallas. Las mutaciones invalidan
 * las queries afectadas, así que los datos cambiados se refrescan igual.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry, staleTime: 30_000 },
  },
});
