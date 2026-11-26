import axios from "axios";

/** Claves de DRF que traen un error general (no atado a un campo). */
const GENERAL_KEYS = ["detail", "non_field_errors"];

/**
 * Aplana los errores anidados de DRF a claves con puntos: `{ details: { pages: ["x"] } }`
 * pasa a `details.pages`. Los índices de listas (`contents: { 0: ["x"] }`) se agrupan en
 * la clave de la lista (`details.contents`), que es la que tiene el formulario.
 */
const flatten = (
  value: unknown,
  path: string,
  out: Record<string, string>,
): void => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, /^\d+$/.test(key) ? path : `${path}.${key}`, out);
    }
  } else if (Array.isArray(value)) {
    for (const child of value) flatten(child, path, out);
  } else if (value !== null && value !== undefined) {
    out[path] = out[path] ? `${out[path]} ${String(value)}` : String(value);
  }
};

/**
 * Error de una request a la API con los mensajes tal como los devolvió el
 * backend, sin texto propio del front. Separa los errores por campo
 * (`{ "email": ["..."] }`) de los generales (`detail`, `non_field_errors`).
 *
 * @param fieldErrors Mensaje del backend por nombre de campo.
 * @param message Mensaje general del backend. Si la respuesta no trae uno (o
 * no hubo respuesta) es el mensaje de axios.
 */
export class ApiError extends Error {
  fieldErrors: Record<string, string>;

  constructor(
    message: string,
    fieldErrors: Record<string, string> = {},
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
  }
}

/** Convierte cualquier error capturado en un `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (!axios.isAxiosError(error)) {
    return new ApiError(
      error instanceof Error ? error.message : String(error),
      {},
      {
        cause: error,
      },
    );
  }

  const data: unknown = error.response?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return new ApiError(
      typeof data === "string" && data.length < 300 ? data : error.message,
      {},
      { cause: error },
    );
  }

  const fieldErrors: Record<string, string> = {};
  const general: string[] = [];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (GENERAL_KEYS.includes(key)) {
      general.push(Array.isArray(value) ? value.join(" ") : String(value));
    } else {
      flatten(value, key, fieldErrors);
    }
  }

  return new ApiError(general.join(" ") || error.message, fieldErrors, {
    cause: error,
  });
}
