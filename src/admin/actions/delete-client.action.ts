import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";

/**
 * Elimina un cliente (`DELETE /clients/:id/`, soft delete → 204). Si falla
 * lanza un `ApiError` con los mensajes del backend.
 */
export const deleteClientAction = async (id: number) => {
  try {
    await charApi.delete(`/clients/${id}/`);
  } catch (error) {
    throw toApiError(error);
  }
};
