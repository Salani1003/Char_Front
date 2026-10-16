import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { UpdateUserRequest } from "../interfaces/update-user.request";
import type { User } from "../interfaces/user.interface";

/**
 * Actualiza un usuario (`PATCH /users/:id/`). Si falla lanza un `ApiError` con
 * los mensajes del backend.
 */
export const updateUserAction = async (
  id: number,
  payload: UpdateUserRequest,
) => {
  try {
    const { data } = await charApi.patch<User>(`/users/${id}/`, payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
