import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/auth/store/auth.store";
import { refreshAction } from "@/auth/actions/refresh.action";
/**
 * Instancia de axios compartida por todo el proyecto para hablar con
 * la API de Char. Un interceptor de request adjunta el `access` token
 * vigente (leído de `useAuthStore`) a cada llamada; un interceptor de
 * response detecta un 401, renueva la sesión una única vez por request
 * (usando el `refresh` token contra `/auth/token/refresh/`, y guardando
 * el par `access`/`refresh` nuevo porque el backend rota el refresh
 * token) y reintenta el request original con el nuevo `access` token. Un 401
 * de `/auth/token/` o `/auth/token/refresh/` (login / refresh) no dispara la
 * renovación. Si el refresh falla (o no hay `refresh` token), limpia la sesión
 * local con `clearSession` de `useAuthStore` (sin llamar al backend) — lo
 * que hace que `ProtectedRoute` redirija a `/auth/login`. Ante un 403 (que no
 * sea de `/users/me/`) vuelve a pedir el usuario con `refreshUser` para
 * renovar sus permisos.
 */
const charApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
charApi.interceptors.request.use((config) => {
  const { access } = useAuthStore.getState();
  if (access) {
    config.headers.set("Authorization", `Bearer ${access}`);
  }
  return config;
});
interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
let refreshPromise: Promise<string | null> | null = null;
const refreshAccessToken = async () => {
  const { refresh, setTokens, clearSession } = useAuthStore.getState();
  if (!refresh) {
    clearSession();
    return null;
  }
  try {
    const { access, refresh: newRefresh } = await refreshAction(refresh);
    setTokens(access, newRefresh);
    return access;
  } catch {
    clearSession();
    return null;
  }
};
charApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    // `/auth/token/` (login) y `/auth/token/refresh/`: un 401 ahí no es una
    // sesión vencida, así que no se intenta renovar.
    // Un 403 significa que los permisos pudieron cambiar: se renuevan (la UI
    // se actualiza sola) y el error se propaga igual a quien hizo el request.
    if (
      error.response?.status === 403 &&
      !originalRequest?.url?.includes("/users/me/")
    ) {
      void useAuthStore.getState().refreshUser();
    }
    const isAuthCall = originalRequest?.url?.includes("/auth/token/");
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthCall
    ) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
    const newAccessToken = await refreshPromise;
    if (!newAccessToken) {
      return Promise.reject(error);
    }
    originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
    return charApi(originalRequest);
  },
);
export { charApi };
