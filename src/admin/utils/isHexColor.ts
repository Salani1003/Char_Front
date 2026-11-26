/**
 * `true` si el texto es un tono `#RRGGBB` (con `#` y seis dígitos
 * hexadecimales, mayúsculas o minúsculas).
 *
 * Casos:
 * - `"#14284B"`, `"#14284b"` → `true`
 * - `"14284B"` (sin `#`), `"#FFF"` (abreviado), `"#GGGGGG"`, `""` → `false`
 */
export const isHexColor = (text: string) => /^#[0-9A-Fa-f]{6}$/.test(text);
