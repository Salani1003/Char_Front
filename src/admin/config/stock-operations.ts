/** Tipo de operación de stock. `ajuste` solo lo genera la confirmación de un recuento. */
export type StockKind = "ingreso" | "egreso" | "ajuste";
/** Tipos que se pueden cargar a mano. */
export type ManualStockKind = Exclude<StockKind, "ajuste">;

export const STOCK_KIND_LABELS: Record<StockKind, string> = {
  ingreso: "Ingreso",
  egreso: "Egreso",
  ajuste: "Ajuste",
};

export const STOCK_KIND_OPTIONS = (
  Object.keys(STOCK_KIND_LABELS) as StockKind[]
).map((value) => ({ value, label: STOCK_KIND_LABELS[value] }));

/** Motivos que se pueden elegir al crear una operación, por tipo (el primero es el predeterminado). */
export const MANUAL_REASONS: Record<
  ManualStockKind,
  { value: string; label: string }[]
> = {
  ingreso: [
    { value: "compra", label: "Compra" },
    { value: "cambio_entrada", label: "Cambio (entra prenda devuelta)" },
    { value: "stock_inicial", label: "Stock inicial" },
    { value: "otro", label: "Otro" },
  ],
  egreso: [
    { value: "rotura_merma", label: "Rotura / merma" },
    { value: "perdida", label: "Pérdida" },
    { value: "uso_interno", label: "Uso interno" },
    { value: "devolucion_proveedor", label: "Devolución a proveedor" },
    { value: "cambio_salida", label: "Cambio (sale prenda nueva)" },
    { value: "otro", label: "Otro" },
  ],
};

/** Todos los motivos que puede mostrar el historial (incluye los que genera el sistema), sin repetir `otro`. */
export const STOCK_REASON_OPTIONS = [
  ...MANUAL_REASONS.ingreso,
  ...MANUAL_REASONS.egreso.filter((reason) => reason.value !== "otro"),
  { value: "recuento", label: "Recuento" },
  { value: "anulacion", label: "Anulación" },
  { value: "venta", label: "Venta" },
];

/** Largo máximo de la nota de una operación. */
export const STOCK_NOTE_MAX_LENGTH = 500;
