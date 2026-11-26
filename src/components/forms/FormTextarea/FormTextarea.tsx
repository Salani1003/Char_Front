import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { Label } from "@/components/char/label";
import { Textarea } from "@/components/char/textarea";

/**
 * Campo de texto largo controlado por react-hook-form, compuesto por `Label` +
 * `Textarea` de Char. Muestra el mensaje de error asociado al campo cuando la
 * validación falla y, si no hay error, la descripción opcional.
 *
 * @param label Texto mostrado sobre el campo.
 * @param description Ayuda breve bajo el campo (se oculta si hay error).
 * @param name Nombre del campo dentro del formulario.
 * @param control Instancia de `control` devuelta por `useForm`.
 * @param textareaProps Resto de props nativas de `textarea` (rows, placeholder, etc.).
 */
export function FormTextarea<TFieldValues extends FieldValues>({
  label,
  description,
  name,
  control,
  rules,
  defaultValue,
  ...textareaProps
}: UseControllerProps<TFieldValues> &
  Omit<React.ComponentProps<typeof Textarea>, "name" | "defaultValue"> & {
    label: string;
    description?: string;
  }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });
  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        {...field}
        {...textareaProps}
        id={name}
        aria-invalid={!!error}
        aria-describedby={description ? `${name}-hint` : undefined}
      />
      {error ? (
        <span className="text-sm text-danger">{error.message}</span>
      ) : (
        description && (
          <span id={`${name}-hint`} className="text-sm text-muted-foreground">
            {description}
          </span>
        )
      )}
    </div>
  );
}
