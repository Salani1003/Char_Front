import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrentUser } from "@/admin/interfaces/user.interface";
import { loginAction } from "../actions/login.action";
import { getCurrentUserAction } from "../actions/get-current-user.action";
import { logoutAction } from "../actions/logout.action";
type AuthStatus = "authenticated" | "not-authenticated";
interface AuthState {
  status: AuthStatus;
  // Properties
  access?: string;
  refresh?: string;
  user?: CurrentUser;
  errorMessage?: string;
  /**
   * `true` cuando la sesión ya se validó contra el backend en esta carga de
   * la página. No se persiste: tras recargar hay que volver a validar.
   */
  sessionVerified: boolean;
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearSession: () => void;
  verifySession: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setTokens: (access: string, refresh: string) => void;
}
const EMPTY_SESSION = {
  status: "not-authenticated" as const,
  access: undefined,
  refresh: undefined,
  user: undefined,
  errorMessage: undefined,
  sessionVerified: false,
};
/** Validación en curso (compartida: React StrictMode monta el guard dos veces). */
let verifying: Promise<void> | null = null;
/** Renovación de permisos en curso (evita pedidos en paralelo). */
let refreshing: Promise<void> | null = null;
/**
 * Store de autenticación (Zustand). Mantiene el estado de sesión
 * (`status`) y los tokens de acceso/refresco emitidos por la API
 * (`access`/`refresh`, nombrados igual que `LoginResponse`), junto con
 * los datos del usuario autenticado (`user`, obtenidos de `GET
 * /users/me/` vía `getCurrentUserAction`). `login` invoca `loginAction`,
 * persiste los tokens, obtiene el usuario y actualiza el `status` según
 * el resultado; si `loginAction` o `getCurrentUserAction` fallan, guarda
 * el mensaje en `errorMessage` para que la UI lo muestre. `logout` invalida
 * el refresh token en el backend (`POST /auth/logout/`, best-effort: si falla
 * igual sigue) y limpia la sesión local. `clearSession` limpia la sesión
 * local sin llamar al backend; la usa el interceptor de `charApi` cuando el
 * refresh ya no sirve. `verifySession` valida la sesión persistida pidiendo
 * `GET /users/me/` (el interceptor renueva el access si hace falta): si el
 * backend la rechaza limpia la sesión, y si no hay conexión la conserva.
 * `sessionVerified` (no persistido) indica que ya se validó en esta carga y
 * lo usa `ProtectedRoute`. `refreshUser` vuelve a pedir `/users/me/` para renovar `is_superuser` y
 * `permissions` con la sesión abierta (best-effort; lo usan `ProtectedRoute` al
 * volver a la pestaña y el interceptor de `charApi` ante un 403). `setTokens` reemplaza el par `access`/`refresh`; lo usa
 * el interceptor de respuesta de `charApi` (fuera de React, vía
 * `useAuthStore.getState()`) cuando renueva la sesión tras un 401. Hay
 * que guardar también el `refresh`: el backend rota el refresh token en
 * cada renovación e invalida el anterior. El estado se persiste en `localStorage` bajo la
 * clave `auth-storage` para mantener la sesión entre recargas.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...EMPTY_SESSION,
      login: async (email, password) => {
        try {
          const data = await loginAction(email, password);
          set({
            status: "authenticated",
            access: data.access,
            refresh: data.refresh,
            errorMessage: undefined,
            sessionVerified: true,
          });
          const user = await getCurrentUserAction();
          set({ user });
          return true;
        } catch (error) {
          set({
            ...EMPTY_SESSION,
            errorMessage:
              error instanceof Error
                ? error.message
                : "Ocurrió un error inesperado.",
          });
          return false;
        }
      },
      logout: async () => {
        const { refresh } = get();
        try {
          if (refresh) await logoutAction(refresh);
        } catch {
          // Si el backend no responde igual cerramos la sesión local.
        }
        set(EMPTY_SESSION);
      },
      clearSession: () => set(EMPTY_SESSION),
      verifySession: () => {
        verifying ??= (async () => {
          try {
            const user = await getCurrentUserAction();
            set({ user, sessionVerified: true });
          } catch (error) {
            // Sin conexión no se puede saber si la sesión sirve: se conserva.
            // El interceptor ya limpió la sesión si el refresh falló.
            if (axios.isAxiosError(error) && !error.response) {
              set({ sessionVerified: true });
            } else {
              set(EMPTY_SESSION);
            }
          }
        })().finally(() => {
          verifying = null;
        });
        return verifying;
      },
      refreshUser: () => {
        if (get().status !== "authenticated") return Promise.resolve();
        refreshing ??= getCurrentUserAction()
          .then((user) => {
            set({ user });
          })
          .catch(() => {
            // Best-effort: un 401 ya lo maneja el interceptor (limpia la sesión).
          })
          .finally(() => {
            refreshing = null;
          });
        return refreshing;
      },
      setTokens: (access, refresh) => {
        set({ access, refresh });
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
