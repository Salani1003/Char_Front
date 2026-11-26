import type { ClientOrigin } from "../interfaces/client.interface";

/** Etiqueta en español de cada origen de cliente. */
export const CLIENT_ORIGIN_LABELS: Record<ClientOrigin, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  referral: "Recomendación",
  physical_store: "Local físico",
  google: "Google",
  other: "Otro",
};

/** Orígenes en el orden en que se muestran en filtros y formularios. */
export const CLIENT_ORIGINS = Object.keys(
  CLIENT_ORIGIN_LABELS,
) as ClientOrigin[];

/** Opciones `{ value, label }` de origen para selects y filtros. */
export const CLIENT_ORIGIN_OPTIONS = CLIENT_ORIGINS.map((value) => ({
  value,
  label: CLIENT_ORIGIN_LABELS[value],
}));

/** `true` si `value` es un origen válido (el backend responde 400 si no). */
export const isClientOrigin = (value: string): value is ClientOrigin =>
  value in CLIENT_ORIGIN_LABELS;
