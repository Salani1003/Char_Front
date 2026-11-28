import { formatSaleMoney, PAYMENT_METHOD_LABELS } from "../config/sales";
import type { PaymentMethod } from "../config/sales";

/**
 * Balance de un cambio: "Devuelve", "Se lleva" y "Diferencia". Muestra las
 * cifras tal como las informa el backend (el detalle o la vista previa): el
 * front no valúa nada. La diferencia se lee según su signo: `> 0` "$ X a
 * pagar" (con el medio de pago si ya se eligió o se pagó), `0` "Sin
 * diferencia" y `< 0` "Sin devolución de $ X" (neutro: no es un error).
 *
 * @param returnedTotal Valor de lo que devuelve (a lo que pagó).
 * @param newTotal Valor de lo que se lleva (precio vigente).
 * @param difference `new − returned`.
 * @param unreturnedAmount Valor que no se reintegra.
 * @param paymentMethod Medio con el que se paga (o pagó) la diferencia.
 * @param loading Atenúa las cifras mientras se recalcula la vista previa.
 */
export function ExchangeBalance({
  returnedTotal,
  newTotal,
  difference,
  unreturnedAmount,
  paymentMethod = "",
  loading,
}: {
  returnedTotal: string;
  newTotal: string;
  difference: string;
  unreturnedAmount: string;
  paymentMethod?: PaymentMethod | "";
  loading?: boolean;
}) {
  const negative = difference.startsWith("-");
  const zero = !negative && /^0+(\.0+)?$/.test(difference);
  const cells = [
    { label: "Devuelve", value: formatSaleMoney(returnedTotal) },
    { label: "Se lleva", value: formatSaleMoney(newTotal) },
    {
      label: "Diferencia",
      value: negative
        ? `Sin devolución de ${formatSaleMoney(unreturnedAmount)}`
        : zero
          ? "Sin diferencia"
          : `${formatSaleMoney(difference)} a pagar${paymentMethod ? ` · ${PAYMENT_METHOD_LABELS[paymentMethod]}` : ""}`,
    },
  ];

  return (
    <dl
      aria-busy={loading}
      className={
        loading
          ? "grid gap-4 opacity-60 transition-opacity sm:grid-cols-3"
          : "grid gap-4 transition-opacity sm:grid-cols-3"
      }
    >
      {cells.map((cell) => (
        <div key={cell.label} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {cell.label}
          </dt>
          <dd className="text-lg font-bold tabular-nums">{cell.value}</dd>
        </div>
      ))}
    </dl>
  );
}
