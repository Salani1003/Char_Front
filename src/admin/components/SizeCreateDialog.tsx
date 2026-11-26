import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import { FormInput } from "@/components/forms/FormInput";
import { getSizeAction } from "../actions/sizes.action";
import { useCatalogCreateFlow } from "../hooks/useCatalogCreateFlow";
import { useAllSizes, useCreateSize } from "../hooks/useSizes";
import type { Size } from "../interfaces/size.interface";
import {
  buildSizeListPreview,
  parseSizeOrder,
  suggestSizeOrder,
} from "../utils/sizeOrder";
import { CatalogCreateDialog } from "./CatalogCreateDialog";

const sizeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(20, "Hasta 20 caracteres"),
  order: z
    .string()
    .refine(
      (v) => parseSizeOrder(v) !== null,
      "Ingresá un número entero, 0 o mayor",
    ),
});

type SizeFormValues = z.infer<typeof sizeSchema>;

const FIELDS = ["name", "order"] as const;

/**
 * Modal "Nuevo talle" (se usará desde el selector de talle de las variantes).
 * Campos: `Nombre *` (hasta 20 caracteres, se ve en **mayúsculas mientras se
 * escribe**, como lo guarda el backend) y `Orden` (entero ≥ 0).
 *
 * - **Orden sugerido**: mayor orden existente + 10 (`suggestSizeOrder`, con
 *   todos los talles cargados vía `useAllSizes`); si la persona ya lo tocó no
 *   se pisa.
 * - **Vista previa "Así queda la lista"**: los talles existentes en el orden
 *   de la API con el nuevo insertado en su lugar y marcado "nuevo"
 *   (`buildSizeListPreview`); se actualiza al editar nombre u orden y se
 *   resume con "…" si hay muchos.
 * - Crea con `POST /sizes/` (`{ name, order }`); `onCreated` recibe el talle
 *   **tal como lo devolvió la API**.
 * - **Nombre repetido**: mensaje bajo el campo y la acción "Usar «XL»", que
 *   trae ese talle por id y lo entrega sin crear nada.
 * - Cerrar con datos sin guardar pide confirmación (ver `CatalogCreateDialog`).
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado al abrir o cerrar.
 * @param onCreated Recibe el talle creado (o el existente elegido con "Usar «…»").
 * @param initialName Texto precargado en el nombre (se pasa a mayúsculas).
 */
export function SizeCreateDialog({
  open,
  onOpenChange,
  onCreated,
  initialName = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (size: Size) => void;
  initialName?: string;
}) {
  const { mutateAsync: createSize } = useCreateSize();
  const sizes = useAllSizes({ enabled: open });
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = useForm<SizeFormValues>({
    resolver: zodResolver(sizeSchema),
    // El orden sugerido llega cuando cargan los talles; `keepDirtyValues`
    // evita pisar lo que la persona ya escribió mientras tanto.
    values: {
      name: initialName.toUpperCase(),
      order: sizes.data ? String(suggestSizeOrder(sizes.data)) : "",
    },
    resetOptions: { keepDirtyValues: true },
  });
  const flow = useCatalogCreateFlow<SizeFormValues, Size>(setError, FIELDS);
  const [name, orderText] = useWatch({ control, name: ["name", "order"] });
  const existing = flow.getExisting(name);
  const order = parseSizeOrder(orderText);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      flow.reset();
    }
    onOpenChange(next);
  };

  const done = (size: Size) => {
    handleOpenChange(false);
    onCreated(size);
  };

  const onSubmit = async (values: SizeFormValues) => {
    try {
      done(
        await createSize({
          name: values.name,
          order: parseSizeOrder(values.order) as number,
        }),
      );
    } catch (error) {
      flow.handleError(error, values.name);
    }
  };

  const preview =
    sizes.data && order !== null
      ? buildSizeListPreview(sizes.data, name, order)
      : null;

  return (
    <CatalogCreateDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Nuevo talle"
      description="Sirve para cualquier convención: letras, números o talle único."
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
          maxLength={20}
          transform={(value) => value.toUpperCase()}
          description="Se guarda siempre en mayúsculas y no puede repetirse. Ej.: XXL, 38, ÚNICO."
        />
        {existing ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="self-start"
            disabled={flow.fetchingExisting}
            onClick={() => flow.applyExisting(getSizeAction, done)}
          >
            Usar «{existing.name}»
          </Button>
        ) : null}
      </div>
      <FormInput
        label="Orden"
        name="order"
        control={control}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        autoComplete="off"
        description="Los talles se muestran de menor a mayor orden. Usá saltos de 10 (10, 20, 30…) para poder intercalar después."
      />
      {preview ? (
        <div className="flex flex-col gap-2 rounded-lg bg-muted px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Así queda la lista
          </span>
          <ul className="flex flex-wrap items-center gap-2">
            {preview.map((item) =>
              item.kind === "gap" ? (
                <li
                  key={item.key}
                  aria-label="más talles"
                  className="text-muted-foreground"
                >
                  …
                </li>
              ) : item.kind === "new" ? (
                <li key={item.key}>
                  <Badge variant="primary">{item.name} · nuevo</Badge>
                </li>
              ) : (
                <li key={item.key}>
                  <Badge variant="outline">{item.name}</Badge>
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}
    </CatalogCreateDialog>
  );
}
