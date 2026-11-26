const priceFormat = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

/** Precio en pesos (`$ 1.500,00`) de un decimal en string (`"1500.00"`). */
export const formatPrice = (value: string) => priceFormat.format(Number(value));
