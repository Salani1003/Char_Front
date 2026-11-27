import axios from "axios";
import { toApiError } from "@/lib/apiError";
import { getHttpStatus } from "./productImages";
import type { StockOperation } from "../interfaces/stock-operation.interface";
import type { StockLevel } from "../interfaces/stock.interface";

/** Estado de una fila de la grilla de stock. */
export type StockState = "out" | "low" | "ok";

/**
 * Estado de una variante: `quantity === 0` es "Sin stock"; si no, `is_low_stock`
 * la marca como "Stock bajo"; si no, "En stock".
 */
export const getStockState = (
  level: Pick<StockLevel, "quantity" | "is_low_stock">,
): StockState =>
  level.quantity === 0 ? "out" : level.is_low_stock ? "low" : "ok";

/**
 * Interpreta lo escrito en el campo de stock mínimo: devuelve el entero ≥ 0 o
 * `null` si no es válido (vacío, decimal, negativo o no numérico).
 */
export const parseMinStock = (text: string): number | null => {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
};

/** Un renglón del formulario de movimiento: la variante elegida y lo escrito en cantidad. */
export interface MovementLine {
  /** Clave estable del renglón (no es el id de la variante). */
  key: string;
  level: StockLevel | null;
  quantity: string;
}

/** Resultado de validar un renglón. */
export interface MovementLineState {
  /** Cantidad entera ≥ 1, o `null` si todavía no es válida. */
  quantity: number | null;
  /** Stock que quedaría; `null` si falta variante o cantidad. */
  after: number | null;
  /** Mensaje a mostrar en el renglón, o `null`. */
  error: string | null;
  /** Listo para enviarse. */
  ready: boolean;
}

/**
 * Valida un renglón del formulario de movimiento: variante repetida en otro
 * renglón, cantidad entera ≥ 1 y, en un egreso, stock suficiente. Es la
 * misma regla que aplica el backend, para que el 400 sea la excepción.
 */
export const getMovementLineState = (
  line: MovementLine,
  index: number,
  lines: MovementLine[],
  kind: "ingreso" | "egreso",
): MovementLineState => {
  const text = line.quantity.trim();
  const parsed = /^\d+$/.test(text) ? Number(text) : NaN;
  const quantity = parsed >= 1 ? parsed : null;
  const level = line.level;
  let error: string | null = null;
  if (
    level &&
    lines.some((other, i) => i !== index && other.level?.id === level.id)
  ) {
    error = "Esta variante ya está en otra línea.";
  } else if (level && text !== "" && quantity === null) {
    error = "La cantidad debe ser un entero mayor a 0.";
  } else if (level && quantity !== null && kind === "egreso") {
    if (quantity > level.quantity)
      error = `Stock insuficiente: disponible ${level.quantity}, solicitado ${quantity}.`;
  }
  const after =
    level && quantity !== null
      ? level.quantity + (kind === "ingreso" ? quantity : -quantity)
      : null;
  return {
    quantity,
    after,
    error,
    ready: !!level && quantity !== null && !error,
  };
};

/**
 * Mensaje de un error de la API de stock: el `detail` del backend si lo hay
 * (stock insuficiente, "ya fue anulado", ...), si no los errores de campo
 * unidos, y como último recurso el mensaje general. El 404 de un objeto viene
 * en inglés: se reemplaza por `notFound`.
 */
export const stockErrorMessage = (error: unknown, notFound?: string) => {
  const apiError = toApiError(error);
  if (notFound && getHttpStatus(apiError) === 404) return notFound;
  const cause = apiError.cause;
  const detail =
    axios.isAxiosError(cause) &&
    cause.response?.data &&
    typeof cause.response.data === "object" &&
    "detail" in cause.response.data
      ? (cause.response.data as { detail: unknown }).detail
      : undefined;
  if (typeof detail === "string" && detail) return detail;
  const fields = Object.values(apiError.fieldErrors);
  return fields.length ? fields.join(" ") : apiError.message;
};

/** Fecha y hora cortas en español (`27/11, 04:17`) a partir de un ISO 8601. */
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Ruta del detalle de una operación de stock. */
export const stockOperationPath = (id: number) =>
  `/admin/inventory/operations/${id}`;

/** Ruta de "Nuevo movimiento", opcionalmente con una variante y un tipo precargados. */
export const newMovementPath = (
  variantId?: number,
  kind?: "ingreso" | "egreso",
) => {
  const query = new URLSearchParams();
  if (variantId !== undefined) query.set("variant", String(variantId));
  if (kind) query.set("kind", kind);
  const text = query.toString();
  return `/admin/inventory/movements/new${text ? `?${text}` : ""}`;
};

/**
 * Destino del "Ver detalle" de una operación del historial: la pantalla del
 * recuento si la generó uno y la persona puede verlo; si no, el detalle de la
 * operación.
 */
export const operationDetailPath = (
  operation: Pick<StockOperation, "id" | "stock_count">,
  canViewCounts: boolean,
) =>
  operation.stock_count !== null && canViewCounts
    ? stockCountPath(operation.stock_count)
    : stockOperationPath(operation.id);

/** Usuario de una operación: la parte local del email, o "–" si se eliminó. */
export const operationUser = (operation: StockOperation) =>
  operation.created_by_email?.split("@")[0] ?? "–";

/** Etiqueta de una variante: `CHAR-0001 · Aurora · Azul · M`. */
export const stockLevelLabel = (level: StockLevel) =>
  `${level.sku} · ${level.product_name} · ${level.color_name} · ${level.size_name}`;

/** Ruta del detalle de un recuento. */
export const stockCountPath = (id: number) => `/admin/inventory/counts/${id}`;

/** Una línea del borrador de un recuento en la pantalla: variante y lo escrito en "Contado". */
export interface CountLine {
  variant: number;
  sku: string;
  product_name: string;
  color_name: string;
  size_name: string;
  /** Texto del campo; vacío = todavía sin contar. */
  counted: string;
}

/** Interpreta lo contado: entero ≥ 0, o `null` si está vacío o no es válido. */
export const parseCounted = (text: string): number | null =>
  /^\d+$/.test(text.trim()) ? Number(text.trim()) : null;

/** Diferencia estimada (`contado − sistema`); `null` si falta alguno de los dos. */
export const countDifference = (
  counted: string,
  system: number | undefined,
): number | null => {
  const value = parseCounted(counted);
  return value === null || system === undefined ? null : value - system;
};

/** Cuántas líneas suben, bajan o quedan igual (ignora las que no se pueden comparar). */
export const summarizeDifferences = (differences: (number | null)[]) => {
  let up = 0;
  let down = 0;
  let same = 0;
  for (const d of differences) {
    if (d === null) continue;
    if (d > 0) up++;
    else if (d < 0) down++;
    else same++;
  }
  return { up, down, same };
};
