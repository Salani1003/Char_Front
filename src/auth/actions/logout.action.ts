import { charApi } from "@/lib/charApi";

/**
 * Cierra la sesión en el backend (`POST /auth/logout/`): mete el refresh
 * token en la blacklist para que no pueda volver a usarse. Lo llama
 * `useAuthStore.logout`, que ignora el error si el backend no responde.
 */
export const logoutAction = async (refresh: string) => {
  await charApi.post("/auth/logout/", { refresh });
};
