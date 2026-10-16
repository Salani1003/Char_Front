import axios from "axios";

type Messages = string | string[];

/** Claves de DRF que traen un error general (no atado a un campo). */
const GENERAL_KEYS = ["detail", "non_field_errors"];

const toText = (value: unknown) =>
  Array.isArray(value) ? value.join(" ") : String(value);

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
  for (const [key, value] of Object.entries(data as Record<string, Messages>)) {
    if (GENERAL_KEYS.includes(key)) general.push(toText(value));
    else fieldErrors[key] = toText(value);
  }

  return new ApiError(general.join(" ") || error.message, fieldErrors, {
    cause: error,
  });
}
