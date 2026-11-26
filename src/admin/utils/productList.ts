import type { ProductVariantItem } from "../interfaces/product.interface";

/** Un color del producto con los talles que tiene en ese color. */
export interface VariantColorGroup {
  colorId: number;
  name: string;
  /** `#RRGGBB` o `""` si el color no tiene tono. */
  hex: string;
  /** Nombres de talle, en el orden en que llegan (ya ordenados por `order`). */
  sizes: string[];
}

/**
 * Agrupa las variantes de un producto por color para mostrarlas en el
 * listado ("Azul · S, M, L"). Conserva el orden de la API (color y talle), así
 * que no reordena nada.
 *
 * @param variants Variantes activas, ya ordenadas por color y talle.
 */
export const groupVariantsByColor = (
  variants: ProductVariantItem[],
): VariantColorGroup[] => {
  const groups = new Map<number, VariantColorGroup>();
  for (const variant of variants) {
    const group = groups.get(variant.color.id);
    if (group) group.sizes.push(variant.size.name);
    else
      groups.set(variant.color.id, {
        colorId: variant.color.id,
        name: variant.color.name,
        hex: variant.color.hex,
        sizes: [variant.size.name],
      });
  }
  return [...groups.values()];
};

/** `"1 variante"` / `"3 variantes"`. */
export const formatVariantsCount = (count: number) =>
  `${count} ${count === 1 ? "variante" : "variantes"}`;
