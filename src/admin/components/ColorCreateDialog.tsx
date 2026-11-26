import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/char/button";
import { FormInput } from "@/components/forms/FormInput";
import { cn } from "@/lib/utils";
import { getColorAction } from "../actions/colors.action";
import { useCreateColor } from "../hooks/useColors";
import { useCatalogCreateFlow } from "../hooks/useCatalogCreateFlow";
import type { Color } from "../interfaces/color.interface";
import {
  buildCreateColorRequest,
  INVALID_TONE_MESSAGE,
  isValidToneInput,
} from "../utils/colorTone";
import { isHexColor } from "../utils/isHexColor";
import { CatalogCreateDialog } from "./CatalogCreateDialog";
import { ColorToneField } from "./ColorToneField";

const colorSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  hex: z.string().refine(isValidToneInput, INVALID_TONE_MESSAGE),
});

type ColorFormValues = z.infer<typeof colorSchema>;

const FIELDS = ["name", "hex"] as const;

/**
 * Modal "Nuevo color", abierto desde el "+" / "Crear…" del selector de color
 * (variantes). Campos: `Nombre *` (precargado con `initialName`) y `Tono
 * (opcional)` (`ColorToneField`). Incluye la vista previa "Así se va a ver".
 *
 * - El tono empieza **vacío ("sin tono")** y `hex` **solo se envía si la
 *   persona eligió uno** (`buildCreateColorRequest`); un código que no es
 *   `#RRGGBB` bloquea el envío con un mensaje.
 * - Al crear cierra, invalida la caché y llama a `onCreated` con el color
 *   **tal como lo devolvió la API** (nombre y tono normalizados).
 * - **Nombre repetido**: mensaje del backend bajo el campo y la acción "Usar
 *   «{existente}»", que trae ese color por id y lo entrega por `onCreated`
 *   sin crear nada.
 * - Cerrar con datos sin guardar pide confirmación (ver `CatalogCreateDialog`).
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado al abrir o cerrar.
 * @param onCreated Recibe el color creado (o el existente elegido con "Usar «…»").
 * @param initialName Texto escrito en el selector, precargado en el nombre.
 */
export function ColorCreateDialog({
  open,
  onOpenChange,
  onCreated,
  initialName = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (color: Color) => void;
  initialName?: string;
}) {
  const { mutateAsync: createColor } = useCreateColor();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty },
  } = useForm<ColorFormValues>({
    resolver: zodResolver(colorSchema),
    values: { name: initialName, hex: "" },
  });
  const flow = useCatalogCreateFlow<ColorFormValues, Color>(setError, FIELDS);
  const [name, hex] = useWatch({ control, name: ["name", "hex"] });
  const existing = flow.getExisting(name);
  const previewTone = isHexColor(hex.trim()) ? hex.trim() : null;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      flow.reset();
    }
    onOpenChange(next);
  };

  const done = (color: Color) => {
    handleOpenChange(false);
    onCreated(color);
  };

  const onSubmit = async (values: ColorFormValues) => {
    try {
      done(await createColor(buildCreateColorRequest(values.name, values.hex)));
    } catch (error) {
      flow.handleError(error, values.name);
    }
  };

  return (
    <CatalogCreateDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Nuevo color"
      description="Queda disponible para todos los productos."
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
          description="No puede repetirse (“azul” y “Azul” son el mismo color)"
        />
        {existing ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="self-start"
            disabled={flow.fetchingExisting}
            onClick={() => flow.applyExisting(getColorAction, done)}
          >
            Usar «{existing.name}»
          </Button>
        ) : null}
      </div>
      <Controller
        control={control}
        name="hex"
        render={({ field, fieldState }) => (
          <ColorToneField
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
        <span className="text-sm text-muted-foreground">Así se va a ver</span>
        <span className="inline-flex items-center gap-2 font-medium">
          <span
            aria-hidden
            style={previewTone ? { backgroundColor: previewTone } : undefined}
            className={cn(
              "size-3.5 shrink-0 rounded-full",
              previewTone
                ? "ring-1 ring-foreground/20"
                : "border border-dashed border-input",
            )}
          />
          {name.trim() || (
            <span className="text-muted-foreground">Nombre del color</span>
          )}
          {previewTone ? null : (
            <span className="text-sm font-normal text-muted-foreground">
              (sin tono)
            </span>
          )}
        </span>
      </div>
    </CatalogCreateDialog>
  );
}
