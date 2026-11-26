import { Badge } from "@/components/char/badge";
import { formatPrice } from "../utils/formatPrice";
import type { ProductVariant } from "../interfaces/product-variant.interface";

/**
 * Precio vigente de una variante. Con promo vigente muestra el precio de promo
 * junto al de venta tachado y el chip "Promo"; si no, solo el de venta
 * (`current_price`).
 *
 * @param variant Variante cuyo precio se muestra.
 */
export function VariantPrice({ variant }: { variant: ProductVariant }) {
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
