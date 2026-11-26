import { Badge } from "@/components/char/badge";
import { formatPrice } from "../utils/formatPrice";
import type { ProductVariant } from "../interfaces/product-variant.interface";

/**
 * Precio vigente de una variante o de un producto (cualquier objeto con
 * `current_price`, `is_on_promo` y `sale_price`). Con promo vigente muestra el precio de promo
 * junto al de venta tachado y el chip "Promo"; si no, solo el de venta
 * (`current_price`).
 *
 * @param variant Variante o producto cuyo precio se muestra.
 */
export function VariantPrice({
  variant,
}: {
  variant: Pick<ProductVariant, "current_price" | "is_on_promo" | "sale_price">;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="font-medium whitespace-nowrap">
        {formatPrice(variant.current_price)}
      </span>
      {variant.is_on_promo ? (
        <>
          <span className="text-xs whitespace-nowrap text-muted-foreground line-through">
            {formatPrice(variant.sale_price)}
          </span>
          <Badge variant="success">Promo</Badge>
        </>
      ) : null}
    </span>
  );
}
