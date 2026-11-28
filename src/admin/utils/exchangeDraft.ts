import type { SaleItem } from "../interfaces/sale.interface";
import type { ExchangePreviewRequest } from "../interfaces/sale.request";
import type { CartLine } from "./saleCart";

/**
 * Lógica pura del armado de un cambio (sin React). Lo que se **devuelve** se
 * guarda como `{ [saleItemId]: cantidad }`; lo que se **lleva** es un carrito
 * de variantes (`CartLine[]`). El balance no se calcula acá: sale de la vista
 * previa del backend.
 */

/** Unidades a devolver por ítem de la venta (solo ítems con cantidad ≥ 1). */
export type ReturnedQuantities = Record<number, number>;

/** Cambia lo que se devuelve de un ítem, acotado a `exchangeable_quantity`; `0` o menos lo quita. */
export const setReturnedQuantity = (
  returned: ReturnedQuantities,
  item: Pick<SaleItem, "id" | "exchangeable_quantity">,
  quantity: number,
): ReturnedQuantities => {
  const next = { ...returned };
  const clamped = Math.min(quantity, item.exchangeable_quantity);
  if (clamped < 1) delete next[item.id];
  else next[item.id] = clamped;
  return next;
};

/** Ids de variante de los ítems que se están devolviendo (no se pueden llevar: el backend no cambia una variante por sí misma). */
export const returnedVariantIds = (
  items: SaleItem[],
  returned: ReturnedQuantities,
) =>
  new Set(
    items.filter((item) => (returned[item.id] ?? 0) > 0).map((i) => i.variant),
  );

/**
 * Body de la vista previa (y base del alta). `null` mientras no se devuelva
 * nada. Las líneas siguen el orden de la venta y del carrito, así el cuerpo es
 * estable y no dispara pedidos de más.
 */
export const buildExchangeRequest = (
  saleId: number,
  items: SaleItem[],
  returned: ReturnedQuantities,
  newLines: CartLine[],
): ExchangePreviewRequest | null => {
  const returned_items = items
    .filter((item) => (returned[item.id] ?? 0) > 0)
    .map((item) => ({ sale_item: item.id, quantity: returned[item.id] }));
  if (returned_items.length === 0) return null;
  return {
    sale: saleId,
    returned_items,
    new_items: newLines.map((line) => ({
      variant: line.variant.id,
      quantity: line.quantity,
    })),
  };
};

/** Signo de una diferencia de la API (`"60.00"` → 1, `"0.00"` → 0, `"-60.00"` → -1). */
export const differenceSign = (difference: string): -1 | 0 | 1 =>
  difference.startsWith("-") ? -1 : /^0+(\.0+)?$/.test(difference) ? 0 : 1;
