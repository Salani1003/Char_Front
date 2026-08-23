import { charApi } from "@/lib/charApi";
import type { User } from "@/admin/interfaces/user.interface";
/**
 * Obtiene la información del usuario autenticado (`GET /users/me/`).
 * Se usa desde `useAuthStore` luego de un login exitoso para completar
 * el estado de sesión con los datos del usuario.
 */
export const getCurrentUserAction = async () => {
  const { data } = await charApi.get<User>("/users/me/");
  return data;
};
