import { charApi } from "@/lib/charApi";
import type { Client } from "../interfaces/client.interface";

/** Trae el detalle de un cliente (`GET /clients/:id/`). */
export const getClientAction = async (id: number) => {
  const { data } = await charApi.get<Client>(`/clients/${id}/`);
  return data;
};
