import { charApi } from "@/admin/charApi";
import type { LoginResponse } from "../interfaces/login.response";

export const loginAction = async (email: string, password: string) => {
  try {
    const { data } = await charApi.post<LoginResponse>("/auth/token/", {
      email,
      password,
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};
