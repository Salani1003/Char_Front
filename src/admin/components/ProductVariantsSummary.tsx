import { Badge } from "@/components/char/badge";
import { VariantColor } from "./VariantColor";
import type { ProductVariantItem } from "../interfaces/product.interface";
import {
  formatVariantsCount,
  groupVariantsByColor,
} from "../utils/productList";

/** Cantidad máxima de colores que se listan antes de resumir el resto ("+2 colores"). */
const MAX_COLORS = 3;

/**
 * Resumen de las variantes de un producto para la vista "Productos". Con
 * `variants` muestra la cantidad y cada color (con su muestra) con sus talles
 * ("Azul · S, M, L"), hasta 3 colores y luego "+n colores". Sin `variants` (el
 * usuario no tiene `products.view_productvariant`) muestra solo la cantidad.
 * Sin ninguna variante muestra el chip "Sin variantes", porque ese producto
 * todavía no se puede publicar.
 *
 * @param count Cantidad de variantes activas (`variants_count`).
 * @param variants Variantes activas, ya ordenadas por color y talle; `undefined` sin permiso.
 */
export function ProductVariantsSummary({
  count,
  variants,
}: {
  count: number;
  variants?: ProductVariantItem[];
}) {
  if (count === 0) return <Badge variant="warning">Sin variantes</Badge>;
  if (!variants) {
    return (
      <span className="whitespace-nowrap">{formatVariantsCount(count)}</span>
    );
  }
  const groups = groupVariantsByColor(variants);
  const hidden = groups.length - MAX_COLORS;
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium whitespace-nowrap">
        {formatVariantsCount(count)}
      </span>
      <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
        {groups.slice(0, MAX_COLORS).map((group) => (
          <li key={group.colorId} className="flex flex-wrap gap-x-1.5">
            <VariantColor name={group.name} hex={group.hex} />
            <span aria-hidden>·</span>
            <span>{group.sizes.join(", ")}</span>
          </li>
        ))}
        {hidden > 0 ? (
          <li>
            +{hidden} {hidden === 1 ? "color" : "colores"}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
