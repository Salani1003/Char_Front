import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";

/**
 * Elimina un usuario (`DELETE /users/:id/`). Si falla lanza un `ApiError` con
 * los mensajes del backend.
 */
export const deleteUserAction = async (id: number) => {
  try {
    await charApi.delete(`/users/${id}/`);
  } catch (error) {
    throw toApiError(error);
  }
};
