import { compareMoney, formatMoney, parseMoney } from "./money";

/** Textos crudos del formulario que intervienen en la promoción (`YYYY-MM-DD` para las fechas). */
export interface PromotionInput {
  salePrice: string;
  promoPrice: string;
  promoStart: string;
  promoEnd: string;
}

/** Errores de la promoción por campo del formulario. */
export type PromotionErrors = Partial<
  Record<"promo_price" | "promo_start" | "promo_end", string>
>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida la promoción como ayuda previa al envío (el backend vuelve a validar):
 * - los tres datos (precio promocional, desde, hasta) **juntos o ninguno**; los
 *   que falten reciben el error;
 * - el precio promocional debe ser un importe válido;
 * - `desde <= hasta` (inclusivas);
 * - precio promocional **menor** al de venta (solo si el de venta es válido).
 *
 * Sin ningún dato cargado no hay errores.
 */
export function validatePromotion(input: PromotionInput): PromotionErrors {
  const price = input.promoPrice.trim();
  const start = input.promoStart.trim();
  const end = input.promoEnd.trim();
  const errors: PromotionErrors = {};

  const filled = [price, start, end].filter(Boolean).length;
  if (filled === 0) return errors;

  if (filled < 3) {
    const message = "Completá los tres datos de la promoción o ninguno";
    if (!price) errors.promo_price = message;
    if (!start) errors.promo_start = message;
    if (!end) errors.promo_end = message;
  }

  const promo = price ? parseMoney(price) : null;
  if (price && promo === null) errors.promo_price = "Ingresá un importe válido";
  if (start && !ISO_DATE.test(start)) errors.promo_start = "Fecha inválida";
  if (end && !ISO_DATE.test(end)) errors.promo_end = "Fecha inválida";

  if (
    ISO_DATE.test(start) &&
    ISO_DATE.test(end) &&
    start > end // `YYYY-MM-DD` ordena igual como texto
  ) {
    errors.promo_end = "Tiene que ser igual o posterior a la fecha «Desde»";
  }

  const sale = parseMoney(input.salePrice);
  if (
    promo !== null &&
    sale !== null &&
    !errors.promo_price &&
    compareMoney(promo, sale) >= 0
  ) {
    errors.promo_price = "Tiene que ser menor al precio de venta";
  }
  return errors;
}

/** Fecha local de hoy como `YYYY-MM-DD` (para pasar a `describeCurrentPrice`). */
export function toLocalIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `"2026-03-05"` → `"05/03/2026"`; otro texto se devuelve sin cambios. */
export function formatIsoDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : iso;
}

/** Resultado de `describeCurrentPrice`. */
export interface CurrentPricePreview {
  /** Precio que rige hoy, ya formateado (`$ 90.000,00`), o `null` si el de venta todavía no es válido. */
  amount: string | null;
  /** Línea que explica qué rige y, si hay promoción, cuándo cambia. */
  note: string;
}

/**
 * Vista previa del **precio vigente** con lo que se escribe en el formulario
 * (el valor real lo calcula el backend como `current_price`):
 * - sin promoción válida: rige el precio de venta;
 * - promoción que empieza después de `today`: hoy rige la venta y la nota dice
 *   cuándo pasa a regir la promocional;
 * - promoción vigente hoy (fechas inclusivas): rige la promocional hasta «hasta»;
 * - promoción ya terminada: rige la venta.
 *
 * @param input Textos del formulario.
 * @param today Fecha de hoy `YYYY-MM-DD` (ver `toLocalIsoDate`); se recibe para que la función sea pura.
 */
export function describeCurrentPrice(
  input: PromotionInput,
  today: string,
): CurrentPricePreview {
  const sale = parseMoney(input.salePrice);
  const saleText = sale ? formatMoney(sale) : null;
  const promo = parseMoney(input.promoPrice);
  const start = input.promoStart.trim();
  const end = input.promoEnd.trim();

  const hasValidPromo =
    sale !== null &&
    promo !== null &&
    ISO_DATE.test(start) &&
    ISO_DATE.test(end) &&
    Object.keys(validatePromotion(input)).length === 0;

  if (!hasValidPromo) {
    return { amount: saleText, note: "Hoy rige el precio de venta." };
  }
  const promoText = formatMoney(promo);
  if (today < start) {
    return {
      amount: saleText,
      note: `Hoy rige el precio de venta. La promoción empieza el ${formatIsoDate(start)} y pasa a regir ${promoText} hasta el ${formatIsoDate(end)}.`,
    };
  }
  if (today <= end) {
    return {
      amount: promoText,
      note: `Hoy rige el precio promocional, hasta el ${formatIsoDate(end)} inclusive. Después vuelve el precio de venta.`,
    };
  }
  return {
    amount: saleText,
    note: `Hoy rige el precio de venta. La promoción terminó el ${formatIsoDate(end)}.`,
  };
}
