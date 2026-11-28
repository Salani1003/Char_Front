import { toApiError } from "@/lib/apiError";
import type { DiscountPercent } from "../config/sales";
import type { ProductVariant } from "../interfaces/product-variant.interface";
import type { CreateSaleRequest } from "../interfaces/sale.request";
import { centsToMoney, moneyToCents } from "./money";

/**
 * Lógica pura del carrito del punto de venta (sin React, para poder razonarla
 * y reutilizarla). Los importes que muestra la pantalla son una **estimación**
 * con `current_price`: al cobrar manda el total que devuelve el backend, que
 * puede diferir por el redondeo al centavo por unidad.
 */

/** Línea del carrito: la variante tal como la devolvió el buscador y la cantidad. */
export interface CartLine {
  variant: ProductVariant;
  quantity: number;
}

/** Tope de unidades de una variante, o `null` si no se conoce el stock (sin `stock.view_stocklevel`: valida el backend). */
export const maxQuantity = (variant: ProductVariant): number | null =>
  variant.quantity ?? null;

/** ¿Es la última unidad en stock? */
export const isLastUnit = (variant: ProductVariant) => variant.quantity === 1;

/** Cantidad de una variante en el carrito (0 si no está). */
export const quantityInCart = (lines: CartLine[], variantId: number) =>
  lines.find((line) => line.variant.id === variantId)?.quantity ?? 0;

/**
 * Motivo por el que no se puede sumar otra unidad de `variant`, o `null` si se
 * puede: agotada, o todo el stock ya está en el carrito.
 */
export const addBlockedReason = (
  lines: CartLine[],
  variant: ProductVariant,
): string | null => {
  const max = maxQuantity(variant);
  if (max === null) return null;
  if (max <= 0) return "Agotada";
  if (quantityInCart(lines, variant.id) >= max) {
    return "Todo el stock está en el carrito";
  }
  return null;
};

/** Suma una unidad (la línea nueva va al final); no pasa del stock. */
export const addToCart = (lines: CartLine[], variant: ProductVariant) => {
  if (addBlockedReason(lines, variant) !== null) return lines;
  const existing = lines.find((line) => line.variant.id === variant.id);
  return existing
    ? lines.map((line) =>
        line === existing ? { ...line, quantity: line.quantity + 1 } : line,
      )
    : [...lines, { variant, quantity: 1 }];
};

/** Cambia la cantidad de una línea, entre 1 y el stock; `0` o menos la quita. */
export const setLineQuantity = (
  lines: CartLine[],
  variantId: number,
  quantity: number,
) =>
  quantity < 1
    ? lines.filter((line) => line.variant.id !== variantId)
    : lines.map((line) => {
        if (line.variant.id !== variantId) return line;
        const max = maxQuantity(line.variant);
        return {
          ...line,
          quantity:
            max === null ? quantity : Math.min(quantity, Math.max(max, 1)),
        };
      });

/** Quita una línea. */
export const removeLine = (lines: CartLine[], variantId: number) =>
  lines.filter((line) => line.variant.id !== variantId);

/** Precio unitario con descuento en centavos: al centavo, mitad hacia arriba (como el backend). */
export const discountedUnitCents = (listCents: number, percent: number) =>
  Math.floor((listCents * (100 - percent) + 50) / 100);

/** Estimación de totales del carrito (importes como string con 2 decimales). */
export interface CartTotals {
  units: number;
  subtotal: string;
  discount: string;
  total: string;
}

/** Estima subtotal (a precio de lista), descuento y total. */
export const estimateCart = (
  lines: CartLine[],
  percent: DiscountPercent,
): CartTotals => {
  let units = 0;
  let subtotal = 0;
  let total = 0;
  for (const { variant, quantity } of lines) {
    const list = moneyToCents(variant.current_price);
    units += quantity;
    subtotal += list * quantity;
    total += discountedUnitCents(list, percent) * quantity;
  }
  return {
    units,
    subtotal: centsToMoney(subtotal),
    discount: centsToMoney(subtotal - total),
    total: centsToMoney(total),
  };
};

/** Precio unitario estimado de una línea con el descuento elegido. */
export const estimatedUnitPrice = (
  variant: ProductVariant,
  percent: DiscountPercent,
) =>
  centsToMoney(
    discountedUnitCents(moneyToCents(variant.current_price), percent),
  );

/** Datos del formulario del cobro, además de las líneas. */
export interface SaleDraft {
  paymentMethod: CreateSaleRequest["payment_method"] | "";
  clientId: number | null;
  discountPercent: DiscountPercent;
  discountReason: string;
  note: string;
}

/**
 * Body de `POST /sales/` desde el carrito. Nunca lleva precios. El motivo del
 * descuento solo se envía con descuento; la nota y el cliente, si hay. Devuelve
 * `null` mientras falte algo obligatorio (ítems o medio de pago).
 */
export const buildCreateSaleRequest = (
  lines: CartLine[],
  draft: SaleDraft,
  idempotencyKey: string,
): CreateSaleRequest | null => {
  if (lines.length === 0 || draft.paymentMethod === "") return null;
  const request: CreateSaleRequest = {
    items: lines.map((line) => ({
      variant: line.variant.id,
      quantity: line.quantity,
    })),
    payment_method: draft.paymentMethod,
    idempotency_key: idempotencyKey,
  };
  if (draft.clientId !== null) request.client = draft.clientId;
  if (draft.discountPercent > 0) {
    request.discount_percent = draft.discountPercent;
    const reason = draft.discountReason.trim();
    if (reason) request.discount_reason = reason;
  }
  const note = draft.note.trim();
  if (note) request.note = note;
  return request;
};

/** Faltante que informa el backend ante un 400 de stock insuficiente. */
export interface StockShortage {
  variantId: number;
  available: number;
  requested: number;
}

/**
 * Si el error es un 400 de stock (`{ detail, variant, available, requested }`,
 * con los números como texto) devuelve el faltante; si no, `null`.
 */
export const parseStockShortage = (error: unknown): StockShortage | null => {
  const { fieldErrors } = toApiError(error);
  const variantId = Number(fieldErrors.variant);
  const available = Number(fieldErrors.available);
  const requested = Number(fieldErrors.requested);
  if (
    !fieldErrors.variant ||
    !Number.isFinite(variantId) ||
    !Number.isFinite(available) ||
    !Number.isFinite(requested)
  ) {
    return null;
  }
  return { variantId, available, requested };
};

/**
 * Ajusta el carrito tras un faltante: la variante queda con lo disponible como
 * stock conocido y como cantidad (se quita si no queda nada). No vacía el resto.
 */
export const applyShortage = (lines: CartLine[], shortage: StockShortage) =>
  lines.flatMap((line) => {
    if (line.variant.id !== shortage.variantId) return [line];
    if (shortage.available < 1) return [];
    return [
      {
        variant: { ...line.variant, quantity: shortage.available },
        quantity: Math.min(line.quantity, shortage.available),
      },
    ];
  });
