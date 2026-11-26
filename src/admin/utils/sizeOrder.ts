import type { Size } from "../interfaces/size.interface";

/** Salto entre talles consecutivos: deja lugar para intercalar otros después. */
export const SIZE_ORDER_STEP = 10;

/** Cantidad de talles por debajo de la cual la vista previa muestra la lista completa. */
const FULL_LIST_LIMIT = 8;
/** Vecinos que se muestran a cada lado del talle nuevo cuando la lista se resume. */
const NEIGHBORS = 2;

/**
 * Orden sugerido para un talle nuevo: el mayor `order` existente + 10, o 10
 * si todavía no hay talles.
 *
 * @param sizes Talles existentes (en cualquier orden).
 */
export function suggestSizeOrder(
  sizes: readonly Pick<Size, "order">[],
): number {
  if (sizes.length === 0) return SIZE_ORDER_STEP;
  return Math.max(...sizes.map((s) => s.order)) + SIZE_ORDER_STEP;
}

/** Elemento de la vista previa "Así queda la lista". */
export type SizePreviewItem =
  | { kind: "size"; key: number; name: string }
  | { kind: "new"; key: "new"; name: string }
  | { kind: "gap"; key: "gap-before" | "gap-after" };

/**
 * Índice donde queda un talle nuevo dentro de la lista ya ordenada por
 * `order`: justo antes del primer talle con `order` **mayor**; ante un empate
 * queda después del existente.
 *
 * @param sizes Talles existentes, ordenados por `order` como los devuelve la API.
 * @param order Orden del talle nuevo.
 */
export function getNewSizeIndex(
  sizes: readonly Pick<Size, "order">[],
  order: number,
): number {
  const index = sizes.findIndex((s) => s.order > order);
  return index === -1 ? sizes.length : index;
}

/**
 * Arma la vista previa "Así queda la lista": los talles existentes (en el
 * orden de la API) con el nuevo insertado en su lugar. Con muchos talles
 * resume: deja los vecinos inmediatos del nuevo y marca con `gap` ("…") los
 * tramos omitidos.
 *
 * @param sizes Talles existentes, ordenados por `order`.
 * @param name Nombre del talle nuevo (ya en mayúsculas; vacío usa "…").
 * @param order Orden del talle nuevo.
 */
export function buildSizeListPreview(
  sizes: readonly Pick<Size, "id" | "name" | "order">[],
  name: string,
  order: number,
): SizePreviewItem[] {
  const index = getNewSizeIndex(sizes, order);
  const toItem = (s: Pick<Size, "id" | "name">): SizePreviewItem => ({
    kind: "size",
    key: s.id,
    name: s.name,
  });
  const newItem: SizePreviewItem = {
    kind: "new",
    key: "new",
    name: name.trim() || "…",
  };

  if (sizes.length < FULL_LIST_LIMIT) {
    return [
      ...sizes.slice(0, index).map(toItem),
      newItem,
      ...sizes.slice(index).map(toItem),
    ];
  }

  const from = Math.max(0, index - NEIGHBORS);
  const to = Math.min(sizes.length, index + NEIGHBORS);
  return [
    ...(from > 0 ? [{ kind: "gap", key: "gap-before" } as const] : []),
    ...sizes.slice(from, index).map(toItem),
    newItem,
    ...sizes.slice(index, to).map(toItem),
    ...(to < sizes.length ? [{ kind: "gap", key: "gap-after" } as const] : []),
  ];
}

/**
 * Convierte el texto del campo "Orden" a número. Devuelve `null` si no es un
 * entero ≥ 0 (vacío, decimal, negativo o con letras).
 */
export function parseSizeOrder(text: string): number | null {
  const trimmed = text.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
}
