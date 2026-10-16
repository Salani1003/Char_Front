import axios from "axios";
import { charApi } from "@/lib/charApi";
import type { RefreshResponse } from "../interfaces/refresh.response";
/**
 * Solicita un nuevo par de tokens al backend a partir del refresh token
 * vigente (`POST /auth/token/refresh/`, convención SimpleJWT). Devuelve
 * `access` y `refresh`: el backend rota el refresh token en cada
 * renovación e invalida el anterior, por lo que el nuevo debe guardarse. Se usa
 * desde el interceptor de respuesta de `charApi` cuando un request
 * responde 401. Lanza un `Error` con mensaje legible si el refresh
 * token es inválido/expiró o si falla la conexión.
 */
export const refreshAction = async (refresh: string) => {
  try {
    const { data } = await charApi.post<RefreshResponse>(
      "/auth/token/refresh/",
      { refresh },
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error(
          "No se pudo conectar con el servidor. Intentá nuevamente.",
          { cause: error },
        );
      }
      throw new Error("La sesión expiró. Iniciá sesión nuevamente.", {
        cause: error,
      });
    }
    throw new Error("Ocurrió un error inesperado.", { cause: error });
  }
};
