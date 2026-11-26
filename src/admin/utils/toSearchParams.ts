/** Valor admitido como parámetro de query. */
export type QueryParamValue = string | number | boolean | null | undefined;

/**
 * Arma los `URLSearchParams` de una request omitiendo los valores vacíos
 * (`undefined`, `null`, `""`). `false` y `0` sí se envían.
 */
export const toSearchParams = (params: Record<string, QueryParamValue>) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  return query;
};
