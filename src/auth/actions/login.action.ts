import axios from "axios";
import { charApi } from "@/lib/charApi";
import type { LoginResponse } from "../interfaces/login.response";
export const loginAction = async (email: string, password: string) => {
  try {
    const { data } = await charApi.post<LoginResponse>("/auth/token/", {
      email,
      password,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error(
          "No se pudo conectar con el servidor. Intentá nuevamente.",
        );
      }
      if (error.response.status === 400 || error.response.status === 401) {
        throw new Error("Email o contraseña incorrectos.");
      }
      throw new Error("Ocurrió un error en el servidor. Intentá más tarde.");
    }
    throw new Error("Ocurrió un error inesperado.");
  }
};
