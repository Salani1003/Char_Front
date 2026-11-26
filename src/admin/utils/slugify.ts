/**
 * Pista del slug que se generaría a partir de un nombre (solo ayuda visual:
 * el valor real lo genera el backend). Pasa a minúsculas, quita tildes,
 * reemplaza todo lo que no sea letra o número por un guion y recorta los
 * guiones de los extremos. `"Vestido Largo Ñandú"` → `"vestido-largo-nandu"`.
 */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
