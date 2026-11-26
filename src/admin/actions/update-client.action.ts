import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Client } from "../interfaces/client.interface";
import type { UpdateClientRequest } from "../interfaces/client.request";

/**
 * Edita un cliente (`PATCH /clients/:id/`). Si falla lanza un `ApiError` con
 * los mensajes del backend (ej. email de un cliente eliminado: 400).
 */
export const updateClientAction = async (
  id: number,
  payload: UpdateClientRequest,
) => {
  try {
    const { data } = await charApi.patch<Client>(`/clients/${id}/`, payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
