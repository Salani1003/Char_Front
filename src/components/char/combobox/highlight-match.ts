/** Normaliza para comparar: minúsculas y sin tildes (la longitud se conserva). */
export const normalizeText = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Un tramo de una etiqueta; `match` indica que coincide con lo buscado. */
export interface TextSegment {
  text: string;
  match: boolean;
}

/**
 * Parte `text` en tramos para resaltar la primera coincidencia de `query`
 * (sin distinguir mayúsculas ni tildes). Sin consulta o sin coincidencia
 * devuelve un único tramo sin resaltar. Función pura.
 *
 * @example splitByMatch("Vestidos › Largos", "la") // [{Vestidos › }, {La, match}, {rgos}]
 */
export function splitByMatch(text: string, query: string): TextSegment[] {
  const needle = normalizeText(query.trim());
  if (!needle) return [{ text, match: false }];
  // normalizar sin NFD compuesto cambia el largo si la etiqueta trae
  // caracteres ya descompuestos; en ese caso se renuncia al resaltado.
  const haystack = normalizeText(text);
  if (haystack.length !== text.length) return [{ text, match: false }];
  const start = haystack.indexOf(needle);
  if (start === -1) return [{ text, match: false }];
  const end = start + needle.length;
  return [
    { text: text.slice(0, start), match: false },
    { text: text.slice(start, end), match: true },
    { text: text.slice(end), match: false },
  ].filter((segment) => segment.text !== "");
}

/**
 * Filtro local del combobox: conserva las opciones cuya etiqueta contiene la
 * consulta (sin distinguir mayúsculas ni tildes) y respeta el orden recibido.
 * Una consulta vacía devuelve todas. Función pura.
 */
export function filterByLabel<T>(
  options: readonly T[],
  query: string,
  getLabel: (option: T) => string,
): T[] {
  const needle = normalizeText(query.trim());
  if (!needle) return [...options];
  return options.filter((o) => normalizeText(getLabel(o)).includes(needle));
}

/**
 * Agrupa opciones consecutivas con el mismo grupo, conservando el orden de
 * llegada (la API ya ordena; no se reordena). Las opciones sin grupo
 * (`undefined`) quedan en un grupo con `label: null`. Función pura.
 */
export function groupOptions<T>(
  options: readonly T[],
  getGroup?: (option: T) => string | null | undefined,
): { label: string | null; options: T[] }[] {
  const groups: { label: string | null; options: T[] }[] = [];
  for (const option of options) {
    const label = getGroup?.(option) ?? null;
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.options.push(option);
    else groups.push({ label, options: [option] });
  }
  return groups;
}
