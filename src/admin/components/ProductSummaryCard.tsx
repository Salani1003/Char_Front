import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/char/card";
import type { Product } from "../interfaces/product.interface";
import { formatMoney } from "../utils/money";
import type { VariantsSummary } from "../utils/productEdit";

/**
 * Tarjeta lateral "Resumen": cantidad de variantes, colores distintos y los
 * talles disponibles por nombre, ej. "XS, S, L" (si se pasa `summary`) y precio vigente del producto
 * (`current_price` de la API).
 *
 * @param product Producto devuelto por la API.
 * @param summary Conteos calculados con `summarizeVariants`; `undefined` si no se pueden ver las variantes (sin `products.view_productvariant`): solo se muestra el precio.
 */
export function ProductSummaryCard({
  product,
  summary,
}: {
  product: Product;
  summary: VariantsSummary | undefined;
}) {
  const rows: { label: string; value: string }[] = [
    ...(summary
      ? [
          { label: "Variantes", value: String(summary.variants) },
          { label: "Colores", value: String(summary.colors) },
          { label: "Talles", value: summary.sizes.join(", ") || "—" },
        ]
      : []),
    { label: "Precio vigente", value: formatMoney(product.current_price) },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-2 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
