import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { Client } from "../interfaces/client.interface";
import type { CreateClientRequest } from "../interfaces/client.request";

/**
 * Crea un cliente (`POST /clients/`). Si el email era de un cliente eliminado
 * el backend lo restaura y lo actualiza con estos datos: también devuelve el
 * cliente y no es un error. Si falla lanza un `ApiError` con los mensajes del
 * backend.
 */
export const createClientAction = async (payload: CreateClientRequest) => {
  try {
    const { data } = await charApi.post<Client>("/clients/", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
