import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toApiError } from "./apiError";

/**
 * Vuelca un error de la API sobre un formulario de react-hook-form: los
 * errores de campo del backend (`{ "email": ["..."] }`) se marcan con
 * `setError` en el campo correspondiente (el primero recibe el foco). Lo que
 * no se pudo asignar a un campo se devuelve como texto para mostrarlo en una
 * alerta, siempre con los mensajes del backend.
 *
 * @param error Error capturado de la request (idealmente un `ApiError`).
 * @param setError `setError` devuelto por `useForm`.
 * @param fields Nombres de los campos que tiene el formulario.
 * @returns Mensaje para la alerta, o `null` si todo se mostró en campos.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): string | null {
  const { fieldErrors, message } = toApiError(error);
  const entries = Object.entries(fieldErrors);
  const unmatched: string[] = [];
  let focused = false;

  for (const [field, text] of entries) {
    if (fields.includes(field)) {
      setError(field as Path<T>, { message: text }, { shouldFocus: !focused });
      focused = true;
    } else {
      unmatched.push(text);
    }
  }

  if (entries.length > 0 && unmatched.length === 0) return null;
  return [message, ...unmatched].join(" ").trim();
}
