import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/admin/interfaces/user.interface";
import { loginAction } from "../actions/login.action";
import { getCurrentUserAction } from "../actions/get-current-user.action";
type AuthStatus = "checking" | "authenticated" | "not-authenticated";
interface AuthState {
  status: AuthStatus;
  // Properties
  access?: string;
  refresh?: string;
  user?: User;
  errorMessage?: string;
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setAccessToken: (access: string) => void;
}
/**
 * Store de autenticación (Zustand). Mantiene el estado de sesión
 * (`status`) y los tokens de acceso/refresco emitidos por la API
 * (`access`/`refresh`, nombrados igual que `LoginResponse`), junto con
 * los datos del usuario autenticado (`user`, obtenidos de `GET
 * /users/me/` vía `getCurrentUserAction`). `login` invoca `loginAction`,
 * persiste los tokens, obtiene el usuario y actualiza el `status` según
 * el resultado; si `loginAction` o `getCurrentUserAction` fallan, guarda
 * el mensaje en `errorMessage` para que la UI lo muestre. `logout` limpia
 * la sesión. `setAccessToken` reemplaza solo el `access` token; lo usa
 * el interceptor de respuesta de `charApi` (fuera de React, vía
 * `useAuthStore.getState()`) cuando renueva la sesión con el refresh
 * token tras un 401. El estado se persiste en `localStorage` bajo la
 * clave `auth-storage` para mantener la sesión entre recargas.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: "not-authenticated",
      access: undefined,
      refresh: undefined,
      user: undefined,
      errorMessage: undefined,
      login: async (email, password) => {
        try {
          const data = await loginAction(email, password);
          set({
            status: "authenticated",
            access: data.access,
            refresh: data.refresh,
            errorMessage: undefined,
          });
          const user = await getCurrentUserAction();
          set({ user });
          return true;
        } catch (error) {
          set({
            status: "not-authenticated",
            access: undefined,
            refresh: undefined,
            user: undefined,
            errorMessage:
              error instanceof Error
                ? error.message
                : "Ocurrió un error inesperado.",
          });
          return false;
        }
      },
      logout: () => {
        set({
          status: "not-authenticated",
          access: undefined,
          refresh: undefined,
          user: undefined,
          errorMessage: undefined,
        });
      },
      setAccessToken: (access) => {
        set({ access });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        status: state.status,
        access: state.access,
        refresh: state.refresh,
        user: state.user,
      }),
    },
  ),
);
