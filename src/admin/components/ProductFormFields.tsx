import { useState, type ReactNode } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/char/card";
import { FormCombobox } from "@/components/forms/FormCombobox";
import { FormInput } from "@/components/forms/FormInput";
import { FormMoneyInput } from "@/components/forms/FormMoneyInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import type { Brand } from "../interfaces/brand.interface";
import type { Category } from "../interfaces/category.interface";
import type { ProductModel } from "../interfaces/product-model.interface";
import type { ProductFormValues } from "../utils/productForm";
import { slugify } from "../utils/slugify";
import { BrandCombobox } from "./BrandCombobox";
import { BrandCreateDialog } from "./BrandCreateDialog";
import { CategoryCombobox } from "./CategoryCombobox";
import { CategoryCreateDialog } from "./CategoryCreateDialog";
import { ProductModelCombobox } from "./ProductModelCombobox";
import { ProductModelCreateDialog } from "./ProductModelCreateDialog";

type CreateKind = "category" | "brand" | "model";

/**
 * Tarjetas "Datos del producto", "Clasificación" y "Precios" (con la
 * promoción opcional) más los modales de alta de categoría, marca y modelo.
 * Es el formulario **compartido** por "Nuevo producto" y "Editar producto":
 * cada pantalla es dueña del `useForm`, del envío y del resto del diseño; este
 * componente solo pinta los campos. Devuelve un fragmento: ponerlo dentro de
 * un contenedor en columna.
 *
 * - **Costo**: solo si `canCost` (`products.view_cost_price`).
 * - **Modelo y marca**: elegir un modelo completa su marca; elegir otra marca
 *   limpia un modelo que no le pertenece (quitar la marca no toca el modelo).
 * - **"+"** de los autocompletados: abren los modales de alta (uno a la vez) y
 *   lo creado queda seleccionado. Con `readOnly` no se ofrecen.
 * - **`readOnly`**: todos los campos deshabilitados (sin `change_product`).
 *
 * @param form Instancia de `useForm<ProductFormValues>` de la pantalla.
 * @param canCost Si se muestra el campo de precio de costo.
 * @param readOnly Deshabilita todos los campos.
 * @param initialOptions Categoría, marca y modelo ya conocidos (el producto los trae resueltos) para mostrar su etiqueta sin pedirlos.
 * @param initialModelBrandId Marca del modelo cargado, para saber si cambiar la marca invalida el modelo.
 * @param slugDescription Ayuda bajo el campo de dirección (slug).
 * @param slugAction Control junto a la dirección (ej. "Regenerar desde el nombre").
 * @param promoAction Control junto al título de la promoción (ej. "Quitar promoción").
 * @param autoFocusName Enfoca el nombre al montar.
 */
export function ProductFormFields({
  form,
  canCost,
  readOnly = false,
  initialOptions,
  initialModelBrandId = null,
  slugDescription,
  slugAction,
  promoAction,
  autoFocusName = false,
}: {
  form: UseFormReturn<ProductFormValues>;
  canCost: boolean;
  readOnly?: boolean;
  initialOptions?: {
    category?: Category;
    brand?: Brand;
    productModel?: ProductModel;
  };
  initialModelBrandId?: number | null;
  slugDescription: string;
  slugAction?: ReactNode;
  promoAction?: ReactNode;
  autoFocusName?: boolean;
}) {
  const { control, setValue, getValues } = form;
  const isSubmitted = form.formState.isSubmitted;
  const name = useWatch({ control, name: "name" });
  const brandId = useWatch({ control, name: "brand" });
  const [modelBrandId, setModelBrandId] = useState<number | null>(
    initialModelBrandId,
  );
  const [createKind, setCreateKind] = useState<CreateKind | null>(null);
  const [createName, setCreateName] = useState("");

  const fieldOptions = { shouldDirty: true, shouldValidate: isSubmitted };

  const pickBrand = (id: number | null) => {
    setValue("brand", id, fieldOptions);
    if (
      id !== null &&
      getValues("product_model") !== null &&
      modelBrandId !== id
    ) {
      setValue("product_model", null, fieldOptions);
      setModelBrandId(null);
    }
  };

  const pickModel = (model: ProductModel | null) => {
    setValue("product_model", model?.id ?? null, fieldOptions);
    setModelBrandId(model?.brand ?? null);
    if (model) setValue("brand", model.brand, fieldOptions);
  };

  const openCreate = (kind: CreateKind) =>
    readOnly
      ? undefined
      : (query: string) => {
          setCreateName(query);
          setCreateKind(kind);
        };
  const closeCreate = (open: boolean) => {
    if (!open) setCreateKind(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Datos del producto</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormInput
            label="Nombre"
            name="name"
            control={control}
            required
            autoComplete="off"
            autoFocus={autoFocusName}
            disabled={readOnly}
          />
          <div className="flex flex-col gap-2">
            <FormInput
              label="Dirección en la tienda (slug)"
              name="slug"
              control={control}
              prefix="/productos/"
              autoComplete="off"
              autoCapitalize="none"
              transform={(value) => value.toLowerCase()}
              placeholder={slugify(name)}
              description={slugDescription}
              disabled={readOnly}
            />
            {readOnly ? null : slugAction}
          </div>
          <FormTextarea
            label="Descripción"
            name="description"
            control={control}
            rows={4}
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clasificación</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormCombobox
            label="Categoría"
            name="category"
            control={control}
            required
            description="Escribí para buscar. Solo se pueden elegir categorías finales (las que no tienen subcategorías). ¿No existe? Creala con el botón +."
          >
            {(field) => (
              <CategoryCombobox
                id={field.id}
                value={field.value as number | null}
                initialOption={initialOptions?.category}
                onChange={(category) => field.onChange(category?.id ?? null)}
                onBlur={field.onBlur}
                error={field.error}
                aria-describedby={field["aria-describedby"]}
                onCreate={openCreate("category")}
                disabled={readOnly}
              />
            )}
          </FormCombobox>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormCombobox label="Marca" name="brand" control={control}>
              {(field) => (
                <BrandCombobox
                  id={field.id}
                  value={field.value as number | null}
                  initialOption={initialOptions?.brand}
                  onChange={(brand) => pickBrand(brand?.id ?? null)}
                  onBlur={field.onBlur}
                  error={field.error}
                  aria-describedby={field["aria-describedby"]}
                  onCreate={openCreate("brand")}
                  disabled={readOnly}
                />
              )}
            </FormCombobox>
            <FormCombobox
              label="Modelo"
              name="product_model"
              control={control}
              description="Lista los modelos de la marca elegida (o todos, si no hay marca). Si elegís solo el modelo, la marca se completa sola."
            >
              {(field) => (
                <ProductModelCombobox
                  id={field.id}
                  value={field.value as number | null}
                  initialOption={initialOptions?.productModel}
                  brandId={brandId}
                  onChange={pickModel}
                  onBlur={field.onBlur}
                  error={field.error}
                  aria-describedby={field["aria-describedby"]}
                  onCreate={openCreate("model")}
                  disabled={readOnly}
                />
              )}
            </FormCombobox>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precios</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {canCost ? (
              <FormMoneyInput
                label="Precio de costo"
                name="cost_price"
                control={control}
                description="Solo con permiso"
                disabled={readOnly}
              />
            ) : null}
            <FormMoneyInput
              label="Precio de venta"
              name="sale_price"
              control={control}
              required
              disabled={readOnly}
            />
          </div>
          <fieldset className="flex flex-col gap-4" disabled={readOnly}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <legend className="text-sm font-medium">
                Promoción (opcional)
              </legend>
              {readOnly ? null : promoAction}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormMoneyInput
                label="Precio promocional"
                name="promo_price"
                control={control}
              />
              <FormInput
                label="Desde"
                name="promo_start"
                control={control}
                type="date"
              />
              <FormInput
                label="Hasta"
                name="promo_end"
                control={control}
                type="date"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Completá los tres datos o ninguno. Las fechas son inclusivas y el
              precio promocional debe ser menor al de venta.
            </p>
          </fieldset>
        </CardContent>
      </Card>

      <CategoryCreateDialog
        open={createKind === "category"}
        onOpenChange={closeCreate}
        initialName={createName}
        onCreated={(category) => {
          if (!category.has_children) {
            setValue("category", category.id, fieldOptions);
          }
        }}
      />
      <BrandCreateDialog
        open={createKind === "brand"}
        onOpenChange={closeCreate}
        initialName={createName}
        onCreated={(brand) => pickBrand(brand.id)}
      />
      <ProductModelCreateDialog
        open={createKind === "model"}
        onOpenChange={closeCreate}
        initialName={createName}
        brandId={brandId}
        onCreated={(model, brand) => {
          setValue("brand", brand.id, fieldOptions);
          pickModel(model);
        }}
      />
    </>
  );
}
