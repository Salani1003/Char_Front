import type { Client } from "../interfaces/client.interface";

/** Nombre y apellido del cliente. */
export const getClientFullName = (client: Client) =>
  `${client.first_name} ${client.last_name}`.trim();
