import type { ClientOrigin } from "./client.interface";

/** Cuerpo de `POST /clients/`. El backend guarda el email en minúsculas. */
export interface CreateClientRequest {
  first_name: string;
  last_name: string;
  email: string;
  origin: ClientOrigin;
  phone?: string;
}

/**
 * Cuerpo de `PATCH /clients/:id/` (edición parcial). `phone: null` borra el
 * teléfono.
 */
export type UpdateClientRequest = Partial<
  Omit<CreateClientRequest, "phone">
> & { phone?: string | null };
