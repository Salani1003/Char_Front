/** Color (`/colors/`). */
export interface Color {
  id: number;
  name: string;
  /** Tono `#RRGGBB` en mayúsculas; `""` si el color no tiene tono. */
  hex: string;
  created_at: string;
}
