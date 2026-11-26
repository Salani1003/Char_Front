import type { CreateColorRequest } from "../interfaces/catalog.request";
import { isHexColor } from "./isHexColor";

/** Tono sugerido para el alta de color (dato de ayuda, no estilo). */
export interface ToneSuggestion {
  /** Nombre en español; es el `aria-label` del botón. */
  name: string;
  /** `#RRGGBB`. */
  hex: string;
}

/** Tonos sugeridos del alta de color, en el orden en que se muestran. */
export const TONE_SUGGESTIONS: readonly ToneSuggestion[] = [
  { name: "Negro", hex: "#1F1B1D" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Rojo", hex: "#B3261E" },
  { name: "Rosa", hex: "#E5A3B8" },
  { name: "Bordó", hex: "#6B1E33" },
  { name: "Azul", hex: "#1F4E9E" },
  { name: "Azul marino", hex: "#14284B" },
  { name: "Verde", hex: "#2E7D4F" },
  { name: "Dorado", hex: "#C9A227" },
  { name: "Beige", hex: "#D9C4A5" },
];

/** Mensaje de error cuando el código de tono escrito no es `#RRGGBB`. */
export const INVALID_TONE_MESSAGE =
  "Ingresá un tono válido con el formato #RRGGBB (ej. #14284B)";

/**
 * Valida el código de tono del formulario: vacío ("sin tono") o `#RRGGBB`.
 * El espacio alrededor se ignora.
 *
 * - `""`, `"  "` → `true`
 * - `"#14284b"` → `true`
 * - `"#FFF"`, `"14284B"` → `false`
 */
export const isValidToneInput = (text: string) => {
  const trimmed = text.trim();
  return trimmed === "" || isHexColor(trimmed);
};

/** `true` si dos tonos `#RRGGBB` son el mismo sin distinguir mayúsculas. */
export const isSameTone = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Arma el cuerpo de `POST /colors/`. **Solo incluye `hex` si la persona
 * eligió un tono**: sin tono (`""`) se omite el campo (nunca se envía `""`).
 * El tono se envía tal cual; el backend lo guarda en mayúsculas.
 *
 * - `("Azul marino", "#14284b")` → `{ name: "Azul marino", hex: "#14284b" }`
 * - `("Rojo", "")` → `{ name: "Rojo" }`
 */
export const buildCreateColorRequest = (
  name: string,
  hex: string,
): CreateColorRequest => {
  const tone = hex.trim();
  return tone === "" ? { name: name.trim() } : { name: name.trim(), hex: tone };
};
