import { useEffect, useState } from "react";

/**
 * Devuelve `value` con retraso: solo se actualiza cuando pasaron `delay` ms
 * sin que `value` cambie. Útil para no disparar una request por cada tecla
 * en un buscador.
 *
 * @param value Valor a retrasar.
 * @param delay Milisegundos de espera; por defecto 300.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
