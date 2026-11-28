import { formatMoney } from "../utils/money";

/** Medios de pago que acepta el backend. */
export type PaymentMethod =
  "transferencia" | "efectivo" | "tarjeta_credito" | "tarjeta_debito" | "qr";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  tarjeta_credito: "Tarjeta de crédito",
  tarjeta_debito: "Tarjeta de débito",
  qr: "QR",
};

export const PAYMENT_METHOD_OPTIONS = (
  Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
).map((value) => ({ value, label: PAYMENT_METHOD_LABELS[value] }));

/** Estado de una venta o de un cambio. */
export type DocStatus = "completada" | "anulada";

export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  completada: "Completada",
  anulada: "Anulada",
};

export const DOC_STATUS_OPTIONS = (
  Object.keys(DOC_STATUS_LABELS) as DocStatus[]
).map((value) => ({ value, label: DOC_STATUS_LABELS[value] }));

/** `in` = el cliente devuelve · `out` = se lleva. */
export type ExchangeDirection = "in" | "out";

/** Descuentos admitidos (a toda la venta). 5 y 10 requieren `sales.apply_discount`. */
export const DISCOUNT_OPTIONS = [0, 5, 10] as const;
export type DiscountPercent = (typeof DISCOUNT_OPTIONS)[number];

/** Largo máximo de la nota y del motivo de anulación. */
export const SALE_NOTE_MAX_LENGTH = 500;

/** Texto de cliente: sin cliente = consumidor final. */
export const CONSUMER_LABEL = "Consumidor final";

/** Etiqueta de un cliente de la venta (sigue apareciendo si se eliminó después). */
export const saleClientLabel = (clientName: string | null) =>
  clientName ?? CONSUMER_LABEL;

/** Importe en pesos (`"180.00"` → `$ 180,00`). Único formateo del módulo. */
export const formatSaleMoney = (value: string) => formatMoney(value) || "–";

/**
 * Presentación de la diferencia de un cambio (`difference`, `unreturned_amount`
 * y medio de pago): `> 0` → "+$ X" (con el medio de pago), `0` → "Sin
 * diferencia", `< 0` → "Sin devolución de $ X" (neutro: no es un error).
 */
export const describeDifference = (
  difference: string,
  unreturnedAmount: string,
  paymentMethod: PaymentMethod | "" = "",
) => {
  if (difference.startsWith("-")) {
    return `Sin devolución de ${formatSaleMoney(unreturnedAmount)}`;
  }
  if (/^0+(\.0+)?$/.test(difference)) return "Sin diferencia";
  const paid = formatSaleMoney(difference);
  return paymentMethod
    ? `+${paid} · ${PAYMENT_METHOD_LABELS[paymentMethod]}`
    : `+${paid}`;
};
