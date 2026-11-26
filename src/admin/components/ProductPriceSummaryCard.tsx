import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/char/card";
import {
  describeCurrentPrice,
  toLocalIsoDate,
  type PromotionInput,
} from "../utils/productPromo";

/**
 * Tarjeta lateral "Precio vigente" del formulario de producto: muestra el
 * precio que rige hoy y una línea que explica la promoción si está cargada
 * (`describeCurrentPrice`). Es una **vista previa calculada en el front** con
 * lo que se escribe; el valor real lo calcula el backend (`current_price`).
 *
 * @param input Precio de venta, precio promocional y fechas, tal como están en el formulario.
 */
export function ProductPriceSummaryCard({ input }: { input: PromotionInput }) {
  const { amount, note } = describeCurrentPrice(
    input,
    toLocalIsoDate(new Date()),
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Precio vigente</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="font-display text-2xl font-medium">{amount ?? "—"}</p>
        <p className="text-sm text-muted-foreground">
          {amount
            ? note
            : "Cargá el precio de venta para ver el precio vigente."}
        </p>
        <p className="text-xs text-muted-foreground">
          Vista previa: el precio definitivo lo calcula el sistema al guardar.
        </p>
      </CardContent>
    </Card>
  );
}
