/** Cuerpo de `POST /categories/`. Omitir `parent` para una categoría principal; `slug` lo genera el backend. */
export interface CreateCategoryRequest {
  name: string;
  parent?: number;
  slug?: string;
}

/** Cuerpo de `POST /brands/`. */
export interface CreateBrandRequest {
  name: string;
  slug?: string;
}

/** Cuerpo de `POST /product-models/`. `brand` es obligatorio. */
export interface CreateProductModelRequest {
  name: string;
  brand: number;
}

/** Cuerpo de `POST /colors/`. Sin tono, omitir `hex` (no enviar `""`). */
export interface CreateColorRequest {
  name: string;
  /** `#RRGGBB`. */
  hex?: string;
}

/** Cuerpo de `POST /sizes/`. */
export interface CreateSizeRequest {
  name: string;
  order: number;
}
