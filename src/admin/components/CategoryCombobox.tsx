import { useState } from "react";
import { Combobox } from "@/components/char/combobox";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { useCategories, useCategory } from "../hooks/useCategories";
import { useComboboxSearch } from "../hooks/useComboboxSearch";
import type { Category } from "../interfaces/category.interface";

/** Agrupa por principal; una principal sin hijas (`parent_name` null) va bajo su propio nombre. */
const getGroup = (category: Category) => category.parent_name ?? category.name;

/**
 * Autocompletado de categoría para el formulario de producto. Pide
 * `GET /categories/?leaf=true&search=…` (solo las asignables, es decir sin
 * subcategorías) con retraso de 250 ms, muestra `label` ("Vestidos › Largos")
 * agrupado por categoría principal y respeta el orden de la API.
 *
 * El valor es el **id**: si la categoría no está entre las opciones cargadas
 * (p. ej. al editar un producto) la busca con `GET /categories/:id/`.
 * `onChange` entrega la categoría completa (o `null` al quitarla).
 *
 * El botón "+" y la fila "Crear categoría «…»" solo aparecen si se pasa
 * `onCreate` **y** la persona tiene `products.add_category`.
 *
 * @param value Id de la categoría elegida, o `null`.
 * @param onChange Categoría elegida o `null`.
 * @param onCreate Abre el alta de categoría con lo escrito (`""` desde el "+").
 */
export function CategoryCombobox({
  value,
  onChange,
  onCreate,
  placeholder = "Buscá una categoría",
  ...rest
}: {
  value: number | null;
  onChange: (category: Category | null) => void;
  onCreate?: (query: string) => void;
  placeholder?: string;
  id?: string;
  onBlur?: () => void;
  disabled?: boolean;
  error?: boolean | string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  const can = useCan();
  const { setQuery, search, pending } = useComboboxSearch();
  const [picked, setPicked] = useState<Category | null>(null);
  const list = useCategories({ leaf: true, search, page_size: 50 });
  const needsDetail =
    value !== null &&
    picked?.id !== value &&
    !list.data?.results.some((c) => c.id === value);
  const detail = useCategory(needsDetail ? value : null);

  const selected =
    value === null
      ? null
      : ((picked?.id === value ? picked : null) ??
        list.data?.results.find((c) => c.id === value) ??
        detail.data ??
        null);

  return (
    <Combobox<Category>
      {...rest}
      value={selected}
      onChange={(category) => {
        setPicked(category);
        onChange(category);
      }}
      options={list.data?.results ?? []}
      getOptionKey={(c) => c.id}
      getOptionLabel={(c) => c.label}
      getOptionGroup={getGroup}
      onInputChange={setQuery}
      loading={list.isFetching || pending}
      placeholder={placeholder}
      clearable
      clearLabel="Quitar categoría"
      onCreate={can(PERMISSIONS.products.category.add) ? onCreate : undefined}
      createLabel={(q) => `Crear categoría «${q}»`}
      createButtonLabel="Nueva categoría"
      emptyMessage={(q) =>
        q
          ? `No hay categorías que coincidan con «${q}»`
          : "No hay categorías disponibles"
      }
    />
  );
}
