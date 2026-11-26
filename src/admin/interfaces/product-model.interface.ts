/** Modelo de una marca (`/product-models/`). El nombre es único por marca. */
export interface ProductModel {
  id: number;
  name: string;
  /** Id de la marca. */
  brand: number;
  created_at: string;
}
