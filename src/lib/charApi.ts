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
 * token) y reintenta el request original con el nuevo `access` token. Si el refresh falla
 * (o no hay `refresh` token), cierra la sesión vía `useAuthStore` — lo
 * que hace que `ProtectedRoute` redirija a `/auth/login`.
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
  const { refresh, setTokens, logout } = useAuthStore.getState();
  if (!refresh) {
    logout();
    return null;
  }
  try {
    const { access, refresh: newRefresh } = await refreshAction(refresh);
    setTokens(access, newRefresh);
    return access;
  } catch {
    logout();
    return null;
  }
};
charApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const isRefreshCall = originalRequest?.url?.includes(
      "/auth/token/refresh/",
    );
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshCall
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
