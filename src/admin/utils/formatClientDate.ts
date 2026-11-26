const dateFormat = new Intl.DateTimeFormat("es-AR", { dateStyle: "short" });
const longDateFormat = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeStyle: "short",
});

/** Fecha corta en español (`26/11/2026`) de un ISO 8601. */
export const formatShortDate = (iso: string) =>
  dateFormat.format(new Date(iso));

/** Fecha y hora largas en español (`26 de noviembre de 2026, 01:53`). */
export const formatLongDate = (iso: string) =>
  longDateFormat.format(new Date(iso));
