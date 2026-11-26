import { create } from "zustand";

interface BreadcrumbState {
  /** Texto que reemplaza al **último** tramo de las migas de pan; `null` = el que declara la ruta. */
  lastLabel: string | null;
  setLastLabel: (label: string | null) => void;
}

/**
 * Estado mínimo para que una pantalla con datos dinámicos (ej. el nombre del
 * producto que se está editando) ponga el texto del último tramo de las migas
 * de pan. Se usa con `useBreadcrumbLabel`; `AdminBreadcrumb` lo lee.
 */
export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  lastLabel: null,
  setLastLabel: (lastLabel) => set({ lastLabel }),
}));
