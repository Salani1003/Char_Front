import type { Sale } from "../interfaces/sale.interface";

/** Ruta del detalle de una venta. */
export const salePath = (id: number) => `/admin/sales/${id}`;
/** Ruta del detalle de un cambio. */
export const exchangePath = (id: number) => `/admin/sales/exchanges/${id}`;
/** Ruta de la pantalla de nueva venta. */
export const NEW_SALE_PATH = "/admin/sales/new";
/** Ruta de la pantalla de nuevo cambio de una venta. */
export const newExchangePath = (saleId: number) =>
  `/admin/sales/${saleId}/exchange/new`;

/** Vendedor de un documento: la parte local del email, o `–` si el usuario se eliminó. */
export const documentUser = (doc: { created_by_email: string | null }) =>
  doc.created_by_email?.split("@")[0] ?? "–";

/** Hoy como `YYYY-MM-DD` en hora de Buenos Aires (la zona del plazo de cambio). */
export const todayInBuenosAires = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());

/** `YYYY-MM-DD` → `27/12/2026`. */
export const formatDeadline = (isoDay: string) => {
  const [year, month, day] = isoDay.split("-");
  return `${day}/${month}/${year}`;
};

/**
 * ¿Aplica "Cambiar" en el listado? Alcanza con venta completada y plazo no
 * vencido (el día límite es inclusivo); el detalle confirma con `can_exchange`.
 */
export const mayExchange = (sale: Sale) =>
  sale.status === "completada" &&
  sale.exchange_deadline >= todayInBuenosAires();

/** Valor que no se reintegra de una diferencia negativa (`"-60.00"` → `"60.00"`); `"0.00"` si no es negativa. */
export const unreturnedFromDifference = (difference: string) =>
  difference.startsWith("-") ? difference.slice(1) : "0.00";
