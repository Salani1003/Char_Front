import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Client } from "../interfaces/client.interface";

/**
 * Restaura un cliente eliminado (`POST /clients/:id/restore/`, sin body).
 * Responde 404 si no estaba eliminado y 400 si su email lo tomó otro cliente
 * mientras tanto. Si falla lanza un `ApiError` con los mensajes del backend.
 */
export const restoreClientAction = async (id: number) => {
  try {
    const { data } = await charApi.post<Client>(`/clients/${id}/restore/`);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
