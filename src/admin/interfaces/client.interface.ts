/** Canal por el que llegó el cliente (enum del backend). */
export type ClientOrigin =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "referral"
  | "physical_store"
  | "google"
  | "other";

/** Cliente (`/clients/`). `id` y `created_at` son de solo lectura. */
export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  origin: ClientOrigin;
  /** Fecha de alta en ISO 8601. */
  created_at: string;
}
