import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/char/button";
import { FormCombobox } from "@/components/forms/FormCombobox";
import { FormInput } from "@/components/forms/FormInput";
import { getBrandAction } from "../actions/brands.action";
import { getProductModelAction } from "../actions/product-models.action";
import { useBrand } from "../hooks/useBrands";
import { useCatalogCreateFlow } from "../hooks/useCatalogCreateFlow";
import { useCreateProductModel } from "../hooks/useProductModels";
import type { Brand } from "../interfaces/brand.interface";
import type { ProductModel } from "../interfaces/product-model.interface";
import { BrandCombobox } from "./BrandCombobox";
import { CatalogCreateDialog } from "./CatalogCreateDialog";

const modelSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    brand: z.number().nullable(),
  })
  .refine((values) => values.brand !== null, {
    path: ["brand"],
    message: "Elegí una marca",
  });

type ModelFormValues = z.infer<typeof modelSchema>;

const FIELDS = ["name", "brand"] as const;

/**
 * Modal "Nuevo modelo", abierto desde el "+" / "Crear modelo «…»" de
 * `ProductModelCombobox`. Campos: `Marca *` y `Nombre del modelo *`
 * (precargado con `initialName`), más la vista previa "Se va a crear como"
 * (`Marca X · Estrella`).
 *
 * - La marca llega precargada si el formulario ya tenía una (`brandId`); si
 *   no, se elige acá con `BrandCombobox` **sin** "+" (nunca hay un modal
 *   dentro de otro: si la marca no existe se crea primero desde el campo
 *   Marca del formulario).
 * - Crea con `POST /product-models/` (`{ name, brand }`). Al crear cierra,
 *   invalida la caché y llama a `onCreated(model, brand)`: el modelo **tal
 *   como lo devolvió la API** y su marca, para que el formulario complete
 *   ambos.
 * - **Nombre repetido** dentro de la marca: mensaje bajo el campo y la acción
 *   "Usar «…»", que trae ese modelo por id y lo entrega (con su marca) sin
 *   crear nada.
 * - Cerrar con datos sin guardar pide confirmación (ver `CatalogCreateDialog`).
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado al abrir o cerrar.
 * @param onCreated Recibe el modelo creado (o el existente) y su marca.
 * @param initialName Texto escrito en el autocompletado, precargado en el nombre.
 * @param brandId Id de la marca elegida en el formulario, precargada; `null` si no hay.
 */
export function ProductModelCreateDialog({
  open,
  onOpenChange,
  onCreated,
  initialName = "",
  brandId = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (model: ProductModel, brand: Brand) => void;
  initialName?: string;
  brandId?: number | null;
}) {
  const { mutateAsync: createModel } = useCreateProductModel();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    values: { name: initialName, brand: brandId },
  });
  const flow = useCatalogCreateFlow<ModelFormValues, ProductModel>(
    setError,
    FIELDS,
  );
  const [name, brandValue] = useWatch({ control, name: ["name", "brand"] });
  const brand = useBrand(brandValue).data;
  const existing = flow.getExisting(name);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      flow.reset();
    }
    onOpenChange(next);
  };

  const done = async (model: ProductModel) => {
    const modelBrand =
      brand?.id === model.brand ? brand : await getBrandAction(model.brand);
    handleOpenChange(false);
    onCreated(model, modelBrand);
  };

  const onSubmit = async (values: ModelFormValues) => {
    try {
      await done(
        await createModel({ name: values.name, brand: values.brand as number }),
      );
    } catch (error) {
      flow.handleError(error, values.name);
    }
  };

  return (
    <CatalogCreateDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Nuevo modelo"
      description="Un modelo siempre pertenece a una marca."
      isDirty={isDirty}
      isSubmitting={isSubmitting || flow.fetchingExisting}
      onSubmit={handleSubmit(onSubmit)}
      errorMessage={flow.alertMessage}
      onErrorClose={flow.clearAlert}
    >
      <FormCombobox
        label="Marca"
        name="brand"
        control={control}
        required
        description="Si la marca no existe, primero creala desde el campo Marca del formulario."
      >
        {(field) => (
          <BrandCombobox
            id={field.id}
            value={field.value as number | null}
            onChange={(selected) => field.onChange(selected?.id ?? null)}
            onBlur={field.onBlur}
            error={field.error}
            aria-describedby={field["aria-describedby"]}
          />
        )}
      </FormCombobox>
      <div className="flex flex-col gap-1">
        <FormInput
          label="Nombre del modelo"
          name="name"
          control={control}
          required
          autoComplete="off"
          autoFocus={brandId !== null}
          description="No puede repetirse dentro de la misma marca"
        />
        {existing ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="self-start"
            disabled={flow.fetchingExisting}
            onClick={() => flow.applyExisting(getProductModelAction, done)}
          >
            Usar «{existing.name}»
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
        <span className="text-sm text-muted-foreground">
          Se va a crear como
        </span>
        <span className="font-medium">
          {brand?.name ?? <span className="text-muted-foreground">Marca</span>}{" "}
          ·{" "}
          {name.trim() || <span className="text-muted-foreground">Modelo</span>}
        </span>
      </div>
    </CatalogCreateDialog>
  );
}
