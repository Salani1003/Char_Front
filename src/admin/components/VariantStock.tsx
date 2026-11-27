import type { ProductVariant } from "../interfaces/product-variant.interface";

/**
 * Stock actual de una variante en el listado de productos: la cantidad en
 * negrita. El estado (Sin stock / Stock bajo / En stock) lo dice
 * `StockStatusBadge` en su propia columna. Si la API no la trae (`quantity`
 * ausente: sin permiso de stock) muestra "–".
 *
 * @param variant Variante con `quantity`.
 */
export function VariantStock({
  variant,
}: {
  variant: Pick<ProductVariant, "quantity">;
}) {
  return variant.quantity === undefined ? (
    <span className="text-muted-foreground">–</span>
  ) : (
    <span className="font-bold tabular-nums">{variant.quantity}</span>
  );
}
