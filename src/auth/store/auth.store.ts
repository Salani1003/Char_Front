import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginAction } from "../actions/login.action";
type AuthStatus = "checking" | "authenticated" | "not-authenticated";
interface AuthState {
  status: AuthStatus;
  // Properties
  access?: string;
  refresh?: string;
  errorMessage?: string;
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
/**
 * Store de autenticación (Zustand). Mantiene el estado de sesión
 * (`status`) y los tokens de acceso/refresco emitidos por la API
 * (`access`/`refresh`, nombrados igual que `LoginResponse`).
 * `login` invoca `loginAction`, persiste los tokens y actualiza el
 * `status` según el resultado; si `loginAction` falla, guarda el
 * mensaje en `errorMessage` para que la UI lo muestre. `logout` limpia
 * la sesión. El estado se persiste en `localStorage` bajo la clave
 * `auth-storage` para mantener la sesión entre recargas.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: "not-authenticated",
      access: undefined,
      refresh: undefined,
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
          return true;
        } catch (error) {
          set({
            status: "not-authenticated",
            access: undefined,
            refresh: undefined,
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
          errorMessage: undefined,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        status: state.status,
        access: state.access,
        refresh: state.refresh,
      }),
    },
  ),
);
