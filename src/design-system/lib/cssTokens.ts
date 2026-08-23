export type CssToken = { name: string; value: string };
function listComputedPropertyNames(computed: CSSStyleDeclaration): string[] {
  const names: string[] = [];
  for (let i = 0; i < computed.length; i++) {
    names.push(computed.item(i));
  }
  return names;
}
/**
 * Lee el valor computado actual de una custom property CSS (`--token`)
 * definida en `src/styles/tokens.css` / `src/index.css`. No hardcodea
 * ningún valor: si el token cambia en esos archivos, el valor devuelto
 * cambia con el próximo build/reload. Esta app es CSR-only, así que leer
 * `getComputedStyle` durante el render (sin `useEffect`/`useState`) es
 * seguro y evita un flash de contenido vacío.
 */
export function readCssToken(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
/**
 * Descubre todas las custom properties CSS definidas en `:root` cuyo
 * nombre empieza con `prefix` (ej. `--char-cream-`), junto con su valor
 * computado actual. Se usa para documentar tokens del Design System sin
 * duplicar sus valores en el código de la página.
 *
 * @param prefix Prefijo del nombre de la custom property (incluye `--`).
 * @param exclude Prefijo adicional a excluir del resultado (útil para
 * separar un grupo de otro que comparte el mismo prefijo raíz).
 */
export function readCssTokens(prefix: string, exclude?: string): CssToken[] {
  if (typeof document === "undefined") return [];
  const computed = getComputedStyle(document.documentElement);
  const names = listComputedPropertyNames(computed).filter(
    (name) =>
      name.startsWith(prefix) && (!exclude || !name.startsWith(exclude)),
  );
  return names.map((name) => ({
    name,
    value: computed.getPropertyValue(name).trim(),
  }));
}
/**
 * Lee un conjunto explícito de custom properties CSS por nombre,
 * preservando el orden pedido (útil para mostrar una escala en su orden
 * semántico — ej. xs → sm → md — en vez de orden alfabético).
 */
export function readNamedCssTokens(names: string[]): CssToken[] {
  if (typeof document === "undefined") {
    return names.map((name) => ({ name, value: "" }));
  }
  const computed = getComputedStyle(document.documentElement);
  return names.map((name) => ({
    name,
    value: computed.getPropertyValue(name).trim(),
  }));
}
