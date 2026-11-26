import type { Color } from "../interfaces/color.interface";
import type { ProductVariantItem } from "../interfaces/product.interface";
import type { Size } from "../interfaces/size.interface";

/** Talles agrupados para el panel "Agregar variantes". */
export interface GroupedSizes {
  /** Los que no son solo dígitos: XS, S, M, L, "ÚNICO"… */
  letters: Size[];
  /** Los que son solo dígitos: 1, 2, 38, 40… */
  numbers: Size[];
}

/**
 * Separa los talles en **Letras** (los que no son solo dígitos) y **Números**
 * (solo dígitos). Respeta el orden recibido (el de la API, por `order`)
 * dentro de cada grupo.
 *
 * @param sizes Talles en el orden de la API.
 */
export function groupSizes(sizes: readonly Size[]): GroupedSizes {
  const letters: Size[] = [];
  const numbers: Size[] = [];
  for (const size of sizes) {
    (/^\d+$/.test(size.name.trim()) ? numbers : letters).push(size);
  }
  return { letters, numbers };
}

/** Una combinación color + talle de la vista previa. */
export interface VariantPreviewItem {
  /** `"colorId-sizeId"`. */
  key: string;
  colorId: number;
  sizeId: number;
  /** `"Azul / L"`. */
  label: string;
  /** `new`: se va a crear; `exists`: el producto ya la tiene y se omite. */
  status: "new" | "exists";
}

/** Resultado de `buildVariantPreview`. */
export interface VariantPreview {
  /** Todas las combinaciones elegidas, en el orden de los talles recibidos. */
  items: VariantPreviewItem[];
  /** Solo las nuevas (las que se envían). */
  toCreate: VariantPreviewItem[];
  /** Cuántas ya existen y se omiten. */
  existingCount: number;
}

/** Clave de una combinación color + talle. */
export const variantKey = (colorId: number, sizeId: number) =>
  `${colorId}-${sizeId}`;

/**
 * Vista previa de lo que va a pasar al crear: cruza el color elegido y los
 * talles tildados con las variantes que el producto ya tiene. Las
 * combinaciones existentes quedan como `exists` (**no** se envían). Sin color
 * o sin talles elegidos no hay combinaciones.
 *
 * El orden es el de `sizes` (el de la API), no el de selección.
 *
 * @param colorId Color elegido (o `null`).
 * @param sizeIds Ids de los talles tildados.
 * @param existing Variantes que el producto ya tiene.
 * @param colors Colores disponibles (para el nombre).
 * @param sizes Talles disponibles, en el orden de la API.
 */
export function buildVariantPreview(
  colorId: number | null,
  sizeIds: readonly number[],
  existing: readonly Pick<ProductVariantItem, "color" | "size">[],
  colors: readonly Pick<Color, "id" | "name">[],
  sizes: readonly Pick<Size, "id" | "name">[],
): VariantPreview {
  const color = colors.find((c) => c.id === colorId);
  if (!color) return { items: [], toCreate: [], existingCount: 0 };
  const taken = new Set(existing.map((v) => variantKey(v.color.id, v.size.id)));
  const items = sizes
    .filter((size) => sizeIds.includes(size.id))
    .map<VariantPreviewItem>((size) => {
      const key = variantKey(color.id, size.id);
      return {
        key,
        colorId: color.id,
        sizeId: size.id,
        label: `${color.name} / ${size.name}`,
        status: taken.has(key) ? "exists" : "new",
      };
    });
  const toCreate = items.filter((item) => item.status === "new");
  return {
    items,
    toCreate,
    existingCount: items.length - toCreate.length,
  };
}

/** Resultado de crear una combinación. */
export type VariantCreateResult =
  | { item: VariantPreviewItem; ok: true; sku: string }
  | { item: VariantPreviewItem; ok: false; message: string };

/**
 * Crea las variantes **de a una y en orden** (no en paralelo, para que los SKU
 * salgan consecutivos). Si una falla sigue con las demás: nunca lanza, devuelve
 * un resultado por combinación con el SKU o el mensaje del error.
 *
 * @param items Combinaciones nuevas a crear.
 * @param create Crea una variante y devuelve su SKU; lanza si falla (ej. un `ApiError`).
 * @param onProgress Se llama antes de cada una con `(número actual, total)`.
 */
export async function createVariantsSequentially(
  items: readonly VariantPreviewItem[],
  create: (item: VariantPreviewItem) => Promise<{ sku: string }>,
  onProgress?: (current: number, total: number) => void,
): Promise<VariantCreateResult[]> {
  const results: VariantCreateResult[] = [];
  for (const [index, item] of items.entries()) {
    onProgress?.(index + 1, items.length);
    try {
      const { sku } = await create(item);
      results.push({ item, ok: true, sku });
    } catch (error) {
      results.push({
        item,
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}
