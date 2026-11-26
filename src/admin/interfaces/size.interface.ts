/** Talle (`/sizes/`). El backend lo guarda en MAYÚSCULAS. */
export interface Size {
  id: number;
  name: string;
  /** Orden de aparición: el menor se muestra primero. */
  order: number;
  created_at: string;
}
