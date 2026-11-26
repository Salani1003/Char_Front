import { useState } from "react";
import { Combobox } from "@/components/char/combobox";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { useBrand, useBrands } from "../hooks/useBrands";
import { useComboboxSearch } from "../hooks/useComboboxSearch";
import type { Brand } from "../interfaces/brand.interface";

/**
 * Autocompletado de marca. Pide `GET /brands/?search=…` con retraso de 250 ms
 * y respeta el orden alfabético de la API.
 *
 * El valor es el **id**: si la marca no está entre las opciones cargadas la
 * busca con `GET /brands/:id/`. `onChange` entrega la marca completa (o
 * `null` al quitarla).
 *
 * El botón "+" y la fila "Crear marca «…»" solo aparecen si se pasa
 * `onCreate` **y** la persona tiene `products.add_brand`.
 *
 * @param value Id de la marca elegida, o `null`.
 * @param onChange Marca elegida o `null`.
 * @param initialOption Opción ya conocida para `value` (p. ej. al editar un producto, que ya trae los nombres): se muestra sin pedirla a la API.
 * @param onCreate Abre el alta de marca con lo escrito (`""` desde el "+").
 */
export function BrandCombobox({
  value,
  onChange,
  onCreate,
  initialOption,
  placeholder = "Buscá una marca",
  ...rest
}: {
  value: number | null;
  onChange: (brand: Brand | null) => void;
  onCreate?: (query: string) => void;
  /** Opción ya conocida para `value` (solo se usa para mostrar su etiqueta sin pedirla a la API). */
  initialOption?: Brand;
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
  const [picked, setPicked] = useState<Brand | null>(null);
  const list = useBrands({ search, page_size: 50 });
  const needsDetail =
    value !== null &&
    picked?.id !== value &&
    initialOption?.id !== value &&
    !list.data?.results.some((b) => b.id === value);
  const detail = useBrand(needsDetail ? value : null);

  const selected =
    value === null
      ? null
      : ((picked?.id === value ? picked : null) ??
        list.data?.results.find((b) => b.id === value) ??
        (initialOption?.id === value ? initialOption : null) ??
        detail.data ??
        null);

  return (
    <Combobox<Brand>
      {...rest}
      value={selected}
      onChange={(brand) => {
        setPicked(brand);
        onChange(brand);
      }}
      options={list.data?.results ?? []}
      getOptionKey={(b) => b.id}
      getOptionLabel={(b) => b.name}
      onInputChange={setQuery}
      loading={list.isFetching || pending}
      placeholder={placeholder}
      clearable
      clearLabel="Quitar marca"
      onCreate={can(PERMISSIONS.products.brand.add) ? onCreate : undefined}
      createLabel={(q) => `Crear marca «${q}»`}
      createButtonLabel="Nueva marca"
      emptyMessage={(q) =>
        q
          ? `No hay marcas que coincidan con «${q}»`
          : "No hay marcas disponibles"
      }
    />
  );
}
