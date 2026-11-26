import { charApi } from "@/lib/charApi";
import type { CurrentUser } from "@/admin/interfaces/user.interface";
/**
 * Obtiene la información del usuario autenticado (`GET /users/me/`).
 * Trae también `is_superuser` y `permissions`, que `can()` usa para decidir
 * el acceso. Se usa desde `useAuthStore` al iniciar sesión, al recargar,
 * al volver a la pestaña y ante un 403.
 */
export const getCurrentUserAction = async () => {
  const { data } = await charApi.get<CurrentUser>("/users/me/");
  return data;
};
