/**
 * Dinero. Los importes que viajan a la API son SIEMPRE strings decimales con
 * dos decimales (`"90000.00"`); nunca se usa `number` para ellos (sin
 * aritmética de punto flotante: todo se resuelve sobre el texto).
 */

/** Entero con puntos de miles (`1234567` → `1.234.567`). */
const groupThousands = (digits: string) =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/**
 * Convierte un texto en formato argentino (punto de miles opcional, coma
 * decimal con hasta 2 decimales) en el string decimal que espera la API.
 * Devuelve `null` si el texto es vacío o inválido. Tolera un `$` inicial y
 * espacios alrededor.
 *
 * Casos:
 * - `"90.000,00"` → `"90000.00"`
 * - `"90000,5"` → `"90000.50"`
 * - `"90000"` → `"90000.00"`
 * - `"0,99"` → `"0.99"`
 * - `"$ 1.500"` → `"1500.00"`
 * - `""`, `"   "`, `"abc"`, `"-5"`, `"1,234"` (3 decimales), `"90000.5"` (punto
 *   que no es de miles), `"1,2,3"` → `null`
 */
export function parseMoney(text: string): string | null {
  const clean = text.replace(/^\s*\$?\s*/, "").trim();
  const match = /^(\d+|\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/.exec(clean);
  if (!match) return null;
  const integer = match[1].replaceAll(".", "").replace(/^0+(?=\d)/, "");
  const decimals = (match[2] ?? "").padEnd(2, "0");
  return `${integer}.${decimals}`;
}

/**
 * Da formato argentino a un decimal de la API (`"90000.00"` → `"$ 90.000,00"`).
 * Si trae más de 2 decimales los recorta; si trae menos los completa. Un valor
 * que no es un decimal (`""`, `"abc"`) devuelve `""`.
 *
 * Casos:
 * - `"90000.00"` → `"$ 90.000,00"`
 * - `"1500.5"` → `"$ 1.500,50"`
 * - `"0.00"` → `"$ 0,00"`
 * - `"-250.00"` → `"-$ 250,00"`
 * - `""` → `""`
 */
export function formatMoney(value: string): string {
  const match = /^(-?)(\d+)(?:\.(\d*))?$/.exec(value.trim());
  if (!match) return "";
  const [, sign, integer, decimals = ""] = match;
  const cents = decimals.slice(0, 2).padEnd(2, "0");
  return `${sign}$ ${groupThousands(integer.replace(/^0+(?=\d)/, ""))},${cents}`;
}

/**
 * Compara dos decimales de la API (`"90000.00"`) sin pasar por floats.
 * Devuelve un número negativo si `a < b`, 0 si son iguales y positivo si
 * `a > b`. Ambos deben ser decimales válidos con hasta 2 decimales (ej. la
 * salida de `parseMoney`).
 */
export function compareMoney(a: string, b: string): number {
  const toCents = (value: string) => {
    const [integer, decimals = ""] = value.split(".");
    return BigInt(integer + decimals.padEnd(2, "0").slice(0, 2));
  };
  const diff = toCents(a) - toCents(b);
  return diff < 0n ? -1 : diff > 0n ? 1 : 0;
}

/**
 * Resta dos decimales de la API (`"200.00" − "180.00"` → `"20.00"`) sin pasar
 * por floats. Puede dar negativo (`"-60.00"`). Ambos deben ser decimales
 * válidos con hasta 2 decimales.
 */
export function subtractMoney(a: string, b: string): string {
  const toCents = (value: string) => {
    const [integer, decimals = ""] = value.split(".");
    return BigInt(integer + decimals.padEnd(2, "0").slice(0, 2));
  };
  const diff = toCents(a) - toCents(b);
  const abs = diff < 0n ? -diff : diff;
  const digits = abs.toString().padStart(3, "0");
  return `${diff < 0n ? "-" : ""}${digits.slice(0, -2)}.${digits.slice(-2)}`;
}

/**
 * Importe decimal de la API (`"90.50"`) en centavos enteros (`9050`). Solo para
 * la **estimación visual** del carrito: los importes que cuentan los calcula el
 * backend. Un texto inválido da `0`.
 */
export function moneyToCents(value: string): number {
  const match = /^(-?)(\d+)(?:\.(\d*))?$/.exec(value.trim());
  if (!match) return 0;
  const cents =
    Number(match[2]) * 100 +
    Number((match[3] ?? "").padEnd(2, "0").slice(0, 2));
  return match[1] ? -cents : cents;
}

/** Centavos enteros (`9050`) → decimal de la API (`"90.50"`). */
export function centsToMoney(cents: number): string {
  const abs = Math.abs(Math.round(cents));
  const digits = String(abs).padStart(3, "0");
  return `${cents < 0 ? "-" : ""}${digits.slice(0, -2)}.${digits.slice(-2)}`;
}
