import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

/** Retraso del autocompletado remoto antes de pedir `?search=`. */
export const COMBOBOX_SEARCH_DELAY = 250;

/**
 * Estado de búsqueda de un autocompletado remoto: `setQuery` recibe cada
 * tecla, `search` es el texto ya retrasado (~250 ms, para el `?search=`;
 * `undefined` si está vacío) y `pending` es `true` mientras lo escrito todavía
 * no es lo que se está pidiendo (cuenta como "cargando").
 */
export function useComboboxSearch() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, COMBOBOX_SEARCH_DELAY);
  const trimmed = debounced.trim();
  return {
    setQuery,
    search: trimmed === "" ? undefined : trimmed,
    pending: query.trim() !== trimmed,
  };
}
