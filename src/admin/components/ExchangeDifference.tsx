import { cn } from "@/lib/utils";
import { describeDifference, type PaymentMethod } from "../config/sales";

/**
 * Diferencia de un cambio en una línea de texto: `> 0` → "+$ X · medio de
 * pago", `0` → "Sin diferencia", `< 0` → "Sin devolución de $ X" (tono
 * neutro: no es un error, solo plata que no se reintegra).
 *
 * @param difference `new − returned` (puede ser negativa).
 * @param unreturnedAmount Valor que no se reintegra (`max(−difference, 0)`).
 * @param paymentMethod Medio con el que se pagó la diferencia, si hubo.
 */
export function ExchangeDifference({
  difference,
  unreturnedAmount,
  paymentMethod = "",
  className,
}: {
  difference: string;
  unreturnedAmount: string;
  paymentMethod?: PaymentMethod | "";
  className?: string;
}) {
  return (
    <span className={cn("whitespace-nowrap tabular-nums", className)}>
      {describeDifference(difference, unreturnedAmount, paymentMethod)}
    </span>
  );
}
