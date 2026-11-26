import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/char/card";
import type { Product } from "../interfaces/product.interface";
import { formatMoney } from "../utils/money";
import { describeApiCurrentPrice } from "../utils/productEdit";
import { toLocalIsoDate } from "../utils/productPromo";

/**
 * Tarjeta lateral "Precio vigente" del producto guardado: muestra
 * `current_price` y `is_on_promo` **tal como los calcula la API** (no se
 * recalculan en el front), con una línea que explica si rige la promoción.
 * Se refresca sola al guardar porque el producto se vuelve a pedir.
 *
 * @param product Producto devuelto por la API.
 */
export function ProductCurrentPriceCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Precio vigente</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="font-display text-2xl font-medium">
          {formatMoney(product.current_price) || "—"}
        </p>
        <p className="text-sm text-muted-foreground">
          {describeApiCurrentPrice(product, toLocalIsoDate(new Date()))}
        </p>
      </CardContent>
    </Card>
  );
}
