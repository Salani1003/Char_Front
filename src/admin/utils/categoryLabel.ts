/** Texto de relleno de la vista previa cuando todavía no se escribió el nombre. */
export const CATEGORY_NAME_PLACEHOLDER = "Nombre de la categoría";

/**
 * Etiqueta con la que se va a ver una categoría nueva, igual que el `label`
 * del backend: `"Indumentaria › Enterizos"` si tiene categoría principal, o
 * solo el nombre si es principal. Es una vista previa: el backend normaliza el
 * nombre al guardarlo, así que el valor definitivo es el que devuelve la API.
 *
 * @param name Nombre escrito (se recortan los espacios; vacío usa un texto de relleno).
 * @param parentName Nombre de la categoría principal elegida, o `null`/`undefined` si no hay.
 */
export function buildCategoryLabel(
  name: string,
  parentName?: string | null,
): string {
  const own = name.trim() || CATEGORY_NAME_PLACEHOLDER;
  return parentName ? `${parentName} › ${own}` : own;
}
