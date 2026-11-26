/** Categoría de producto (`/categories/`). Máximo dos niveles. */
export interface Category {
  id: number;
  name: string;
  slug: string;
  /** Id de la categoría principal; `null` si esta es principal. */
  parent: number | null;
  /** Nombre de la principal; `null` si esta es principal. */
  parent_name: string | null;
  /** `"Vestidos › Largos"` (o solo el nombre si es principal). */
  label: string;
  /** Si es `true` no se puede asignar a un producto (solo las finales). */
  has_children: boolean;
  /** Productos activos; si es `> 0` no admite subcategorías. */
  products_count: number;
  created_at: string;
}
