import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/char/button";
import { FormInput } from "@/components/forms/FormInput";
import { getBrandAction } from "../actions/brands.action";
import { useCreateBrand } from "../hooks/useBrands";
import { useCatalogCreateFlow } from "../hooks/useCatalogCreateFlow";
import type { Brand } from "../interfaces/brand.interface";
import { CatalogCreateDialog } from "./CatalogCreateDialog";

const brandSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
});

type BrandFormValues = z.infer<typeof brandSchema>;

const FIELDS = ["name"] as const;

/**
 * Modal "Nueva marca", abierto desde el "+" / "Crear marca «…»" de
 * `BrandCombobox`. Un solo campo, `Nombre *` (precargado con `initialName`);
 * el slug no se muestra (lo genera el backend). Crea con `POST /brands/`.
 *
 * - Al crear cierra, invalida la caché y llama a `onCreated` con la marca
 *   **tal como la devolvió la API** (el nombre puede venir normalizado, ej.
 *   "nike" → "Nike").
 * - **Nombre repetido**: se muestra el mensaje del backend bajo el campo y la
 *   acción "Usar «{existente}»", que trae esa marca por id y la entrega por
 *   `onCreated` sin crear nada.
 * - Cerrar con datos sin guardar pide confirmación (ver `CatalogCreateDialog`).
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado al abrir o cerrar.
 * @param onCreated Recibe la marca creada (o la existente elegida con "Usar «…»").
 * @param initialName Texto escrito en el autocompletado, precargado en el nombre.
 */
export function BrandCreateDialog({
  open,
  onOpenChange,
  onCreated,
  initialName = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (brand: Brand) => void;
  initialName?: string;
}) {
  const { mutateAsync: createBrand } = useCreateBrand();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    values: { name: initialName },
  });
  const flow = useCatalogCreateFlow<BrandFormValues, Brand>(setError, FIELDS);
  const name = useWatch({ control, name: "name" });
  const existing = flow.getExisting(name);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      flow.reset();
    }
    onOpenChange(next);
  };

  const done = (brand: Brand) => {
    handleOpenChange(false);
    onCreated(brand);
  };

  const onSubmit = async (values: BrandFormValues) => {
    try {
      done(await createBrand({ name: values.name }));
    } catch (error) {
      flow.handleError(error, values.name);
    }
  };

  return (
    <CatalogCreateDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Nueva marca"
      description="Se va a seleccionar sola en el producto."
      isDirty={isDirty}
      isSubmitting={isSubmitting || flow.fetchingExisting}
      onSubmit={handleSubmit(onSubmit)}
      errorMessage={flow.alertMessage}
      onErrorClose={flow.clearAlert}
    >
      <div className="flex flex-col gap-1">
        <FormInput
          label="Nombre"
          name="name"
          control={control}
          required
          autoComplete="off"
          autoFocus
        />
        {existing ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="self-start"
            disabled={flow.fetchingExisting}
            onClick={() => flow.applyExisting(getBrandAction, done)}
          >
            Usar «{existing.name}»
          </Button>
        ) : null}
      </div>
    </CatalogCreateDialog>
  );
}
