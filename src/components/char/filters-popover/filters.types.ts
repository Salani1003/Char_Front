export interface FilterOption {
  value: string;
  label: string;
}

interface BaseFilter {
  /** Clave del filtro dentro de `FilterValues`. */
  key: string;
  label: string;
}

/** Selección única con opciones en forma de chips (incluye "Todos" automáticamente). */
export interface ChipsFilter extends BaseFilter {
  type: "chips";
  options: FilterOption[];
}

/** Selección única en un desplegable (incluye "Todos" automáticamente). */
export interface SelectFilter extends BaseFilter {
  type: "select";
  options: FilterOption[];
  placeholder?: string;
}

export interface TextFilter extends BaseFilter {
  type: "text";
  placeholder?: string;
}

/** Casilla de verificación: el valor es `'true'` cuando está marcada. */
export interface CheckboxFilter extends BaseFilter {
  type: "checkbox";
}

/** Fecha (`AAAA-MM-DD`), con el selector nativo del navegador. */
export interface DateFilter extends BaseFilter {
  type: "date";
}

export type FilterDefinition =
  ChipsFilter | SelectFilter | TextFilter | CheckboxFilter | DateFilter;

/** Valores por clave. Un filtro sin valor (o `''`) se considera inactivo. */
export type FilterValues = Record<string, string>;
