import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/char/button";
import { Skeleton } from "@/components/char/skeleton";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect, type SelectOption } from "@/components/forms/FormSelect";
import { toApiError } from "@/lib/apiError";
import { getCategoryAction } from "../actions/categories.action";
import { useAllCategories, useCreateCategory } from "../hooks/useCategories";
import { useCatalogCreateFlow } from "../hooks/useCatalogCreateFlow";
import type { Category } from "../interfaces/category.interface";
import { buildCategoryLabel } from "../utils/categoryLabel";
import { CatalogCreateDialog } from "./CatalogCreateDialog";

/** Valor del selector para "sin categoría principal". */
const NO_PARENT = "none";

const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  parent: z.string(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const FIELDS = ["name", "parent"] as const;

/**
 * Modal "Nueva categoría", abierto desde el "+" / "Crear categoría «…»" de
 * `CategoryCombobox`. Campos: `Nombre *` (precargado con `initialName`) y
 * `Categoría principal (opcional)`, un selector con las principales
 * (`GET /categories/?root=true`, orden de la API). Las que ya tienen
 * productos (`products_count > 0`) aparecen deshabilitadas con "(ya tiene
 * productos)": el backend no admite subcategorías bajo ellas. Incluye la
 * vista previa "Se va a crear como" (`buildCategoryLabel`).
 *
 * - Crea con `POST /categories/` (`parent` se omite si es una principal; el
 *   slug lo genera el backend).
 * - Al crear cierra, invalida la caché y llama a `onCreated` con la categoría
 *   **tal como la devolvió la API**. Una categoría recién creada siempre es
 *   asignable (`has_children: false`); el autocompletado la selecciona solo
 *   si lo es.
 * - **Nombre repetido** (único solo entre hermanas): mensaje bajo el campo y
 *   la acción "Usar «…»", que trae esa categoría por id y la entrega por
 *   `onCreated` sin crear nada.
 * - Un error bajo `parent` se muestra en el selector y se vuelve a pedir la
 *   lista de principales (pudo cambiar mientras tanto).
 * - Cerrar con datos sin guardar pide confirmación (ver `CatalogCreateDialog`).
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado al abrir o cerrar.
 * @param onCreated Recibe la categoría creada (o la existente elegida con "Usar «…»").
 * @param initialName Texto escrito en el autocompletado, precargado en el nombre.
 */
export function CategoryCreateDialog({
  open,
  onOpenChange,
  onCreated,
  initialName = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (category: Category) => void;
  initialName?: string;
}) {
  const { mutateAsync: createCategory } = useCreateCategory();
  const roots = useAllCategories({ root: true }, { enabled: open });
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    values: { name: initialName, parent: NO_PARENT },
  });
  const flow = useCatalogCreateFlow<CategoryFormValues, Category>(
    setError,
    FIELDS,
  );
  const [name, parent] = useWatch({ control, name: ["name", "parent"] });
  const existing = flow.getExisting(name);
  const parentName =
    roots.data?.find((c) => String(c.id) === parent)?.name ?? null;

  const options: SelectOption[] = [
    { value: NO_PARENT, label: "Ninguna (será una categoría principal)" },
    ...(roots.data ?? []).map((c) => ({
      value: String(c.id),
      label: c.products_count > 0 ? `${c.name} (ya tiene productos)` : c.name,
      disabled: c.products_count > 0,
    })),
  ];

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      flow.reset();
    }
    onOpenChange(next);
  };

  const done = (category: Category) => {
    handleOpenChange(false);
    onCreated(category);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      done(
        await createCategory({
          name: values.name,
          ...(values.parent !== NO_PARENT && { parent: Number(values.parent) }),
        }),
      );
    } catch (error) {
      if (toApiError(error).fieldErrors.parent) void roots.refetch();
      flow.handleError(error, values.name);
    }
  };

  return (
    <CatalogCreateDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Nueva categoría"
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
            onClick={() => flow.applyExisting(getCategoryAction, done)}
          >
            Usar «{existing.name}»
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        {roots.isPending ? (
          <Skeleton className="h-8 w-full" aria-label="Cargando categorías" />
        ) : roots.isError ? (
          <div role="alert" className="flex items-center gap-2 text-sm">
            <span className="text-danger">
              No se pudieron cargar las categorías principales.
            </span>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => void roots.refetch()}
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <FormSelect
            label="Categoría principal (opcional)"
            name="parent"
            control={control}
            options={options}
          />
        )}
        <span className="text-sm text-muted-foreground">
          Hay dos niveles como máximo. Una categoría que ya tiene productos no
          admite subcategorías, por eso aparece deshabilitada.
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
        <span className="text-sm text-muted-foreground">
          Se va a crear como
        </span>
        <span className="font-medium">
          {buildCategoryLabel(name, parentName)}
        </span>
      </div>
    </CatalogCreateDialog>
  );
}
