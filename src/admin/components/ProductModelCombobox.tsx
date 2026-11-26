import { useState } from "react";
import { Combobox } from "@/components/char/combobox";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { useAllBrands } from "../hooks/useBrands";
import { useComboboxSearch } from "../hooks/useComboboxSearch";
import { useProductModel, useProductModels } from "../hooks/useProductModels";
import type { ProductModel } from "../interfaces/product-model.interface";

/**
 * Autocompletado de modelo. Con marca elegida (`brandId`) pide
 * `GET /product-models/?brand=<id>&search=…` y lista solo el nombre del
 * modelo; sin marca lista todos con la etiqueta `"Marca X · Aurora"` (el
 * nombre de la marca sale de la lista de marcas cacheada). Retraso de 250 ms,
 * orden de la API.
 *
 * El valor es el **id**: si el modelo no está entre las opciones cargadas lo
 * busca con `GET /product-models/:id/`. `onChange` entrega el modelo completo
 * (su `brand` es el id de la marca, para que el formulario complete ambos) o
 * `null` al quitarlo. Quitar o cambiar la marca no limpia el modelo: eso lo
 * decide el formulario.
 *
 * El botón "+" y la fila "Crear modelo «…»" solo aparecen si se pasa
 * `onCreate` **y** la persona tiene `products.add_productmodel`.
 *
 * @param value Id del modelo elegido, o `null`.
 * @param brandId Id de la marca elegida; filtra la lista.
 * @param onChange Modelo elegido (con su `brand`) o `null`.
 * @param initialOption Opción ya conocida para `value` (p. ej. al editar un producto, que ya trae los nombres): se muestra sin pedirla a la API.
 * @param onCreate Abre el alta de modelo con lo escrito (`""` desde el "+").
 */
export function ProductModelCombobox({
  value,
  brandId = null,
  onChange,
  onCreate,
  initialOption,
  placeholder = "Buscá un modelo",
  ...rest
}: {
  value: number | null;
  brandId?: number | null;
  onChange: (model: ProductModel | null) => void;
  onCreate?: (query: string) => void;
  /** Opción ya conocida para `value` (solo se usa para mostrar su etiqueta sin pedirla a la API). */
  initialOption?: ProductModel;
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
  const [picked, setPicked] = useState<ProductModel | null>(null);
  const list = useProductModels({
    brand: brandId ?? undefined,
    search,
    page_size: 50,
  });
  const brands = useAllBrands({ enabled: brandId === null });
  const needsDetail =
    value !== null &&
    picked?.id !== value &&
    initialOption?.id !== value &&
    !list.data?.results.some((m) => m.id === value);
  const detail = useProductModel(needsDetail ? value : null);

  const selected =
    value === null
      ? null
      : ((picked?.id === value ? picked : null) ??
        list.data?.results.find((m) => m.id === value) ??
        (initialOption?.id === value ? initialOption : null) ??
        detail.data ??
        null);

  const brandName = (model: ProductModel) =>
    brands.data?.find((b) => b.id === model.brand)?.name;
  const getLabel = (model: ProductModel) => {
    const brand = brandId === null ? brandName(model) : undefined;
    return brand ? `${brand} · ${model.name}` : model.name;
  };

  return (
    <Combobox<ProductModel>
      {...rest}
      value={selected}
      onChange={(model) => {
        setPicked(model);
        onChange(model);
      }}
      options={list.data?.results ?? []}
      getOptionKey={(m) => m.id}
      getOptionLabel={getLabel}
      onInputChange={setQuery}
      loading={list.isFetching || pending}
      placeholder={placeholder}
      clearable
      clearLabel="Quitar modelo"
      onCreate={
        can(PERMISSIONS.products.productModel.add) ? onCreate : undefined
      }
      createLabel={(q) => `Crear modelo «${q}»`}
      createButtonLabel="Nuevo modelo"
      emptyMessage={(q) =>
        q
          ? `No hay modelos que coincidan con «${q}»`
          : "No hay modelos disponibles"
      }
    />
  );
}
