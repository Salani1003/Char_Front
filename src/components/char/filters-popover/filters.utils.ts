/** Separa el valor de un filtro `multiselect` (`"a,b"`) en una lista. */
export const parseMultiValue = (value: string | undefined): string[] =>
  value ? value.split(",").filter(Boolean) : [];

/** Une las opciones elegidas de un filtro `multiselect` en su valor (`"a,b"`). */
export const joinMultiValue = (values: string[]): string => values.join(",");
