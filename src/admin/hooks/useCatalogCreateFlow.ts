import { useState } from "react";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import { applyApiErrors } from "@/lib/applyApiErrors";
import { toApiError, type ExistingRecord } from "@/lib/apiError";

/**
 * Manejo de errores y de "nombre repetido" de los modales de alta de
 * catálogo (marca, color, ...).
 *
 * - `handleError(error, failedName)`: vuelca los 400 del backend sobre los
 *   campos del formulario; el resto de los errores queda en `alertMessage`.
 *   Si el 400 trae `existing` (nombre repetido) lo recuerda junto con el
 *   nombre que lo causó.
 * - `getExisting(currentName)`: el registro ya existente, **solo mientras el
 *   nombre escrito siga siendo el que falló** (al corregirlo desaparece la
 *   acción "Usar «…»").
 * - `applyExisting(fetchRecord, onDone)`: obtiene ese registro por id y lo
 *   entrega sin crear nada (`onDone`); si falla, deja el error en `alertMessage`.
 * - `reset()`: limpia todo (al cerrar el modal).
 *
 * @param setError `setError` del formulario.
 * @param fields Nombres de los campos del formulario.
 */
export function useCatalogCreateFlow<TValues extends FieldValues, TRecord>(
  setError: UseFormSetError<TValues>,
  fields: readonly string[],
) {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [found, setFound] = useState<{
    record: ExistingRecord;
    forName: string;
  } | null>(null);
  const [fetchingExisting, setFetchingExisting] = useState(false);

  const handleError = (error: unknown, failedName: string) => {
    const { existing } = toApiError(error);
    setFound(
      existing ? { record: existing, forName: failedName.trim() } : null,
    );
    const message = applyApiErrors(error, setError, fields);
    if (message) setAlertMessage(message);
  };

  const getExisting = (currentName: string) =>
    found && found.forName === currentName.trim() ? found.record : null;

  const applyExisting = async (
    fetchRecord: (id: number) => Promise<TRecord>,
    onDone: (record: TRecord) => void,
  ) => {
    if (!found) return;
    setFetchingExisting(true);
    try {
      onDone(await fetchRecord(found.record.id));
    } catch (error) {
      setAlertMessage(toApiError(error).message);
    } finally {
      setFetchingExisting(false);
    }
  };

  const reset = () => {
    setFound(null);
    setAlertMessage(null);
  };

  return {
    alertMessage,
    clearAlert: () => setAlertMessage(null),
    handleError,
    getExisting,
    applyExisting,
    fetchingExisting,
    reset,
  };
}
