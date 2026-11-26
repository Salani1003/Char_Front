import { useEffect } from "react";
import { useBreadcrumbStore } from "../store/breadcrumb.store";

/**
 * Pone `label` como último tramo de las migas de pan mientras la pantalla
 * está montada (ej. el nombre del producto en `/admin/products/:id`). Con
 * `null`/`undefined` queda el texto que declara la ruta. Al desmontar se
 * restablece.
 */
export function useBreadcrumbLabel(label: string | null | undefined) {
  const setLastLabel = useBreadcrumbStore((state) => state.setLastLabel);
  useEffect(() => {
    setLastLabel(label ?? null);
    return () => setLastLabel(null);
  }, [label, setLastLabel]);
}
