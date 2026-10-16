import { charApi } from "@/lib/charApi";
import { toApiError } from "@/lib/apiError";
import type { CreateUserRequest } from "../interfaces/create-user.request";
import type { User } from "../interfaces/user.interface";

/**
 * Crea un usuario. Si falla lanza un `ApiError` con los mensajes del backend.
 */
export const createUserAction = async (payload: CreateUserRequest) => {
  try {
    const { data } = await charApi.post<User>("/users/", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
