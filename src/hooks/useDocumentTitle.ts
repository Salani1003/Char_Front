import { useEffect } from "react";

/**
 * Cambia el `document.title` mientras el componente está montado y lo
 * restaura al desmontar. Pensado para que cada pantalla ponga su título en la
 * pestaña del navegador (ej. "Usuarios · Char").
 *
 * @param title Título de la pestaña; si es `undefined` no cambia nada.
 */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
