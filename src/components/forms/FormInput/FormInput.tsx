import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { cn } from "@/lib/utils";
/**
 * Campo de formulario controlado por react-hook-form, compuesto por `Label` +
 * `Input` de Char. Muestra el mensaje de error asociado al campo cuando la
 * validación falla.
 *
 * @param label Texto mostrado sobre el input.
 * @param name Nombre del campo dentro del formulario (debe coincidir con el schema/defaultValues).
 * @param control Instancia de `control` devuelta por `useForm`.
 * @param className Clases adicionales para el `Input`.
 * @param inputProps Resto de props nativas de `input` (type, placeholder, autoComplete, etc.).
 */
export function FormInput<TFieldValues extends FieldValues>({
  label,
  name,
  control,
  rules,
  defaultValue,
  className,
  ...inputProps
}: UseControllerProps<TFieldValues> &
  Omit<React.ComponentProps<typeof Input>, "name" | "defaultValue"> & {
    label: string;
  }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });
  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        {...field}
        {...inputProps}
        id={name}
        aria-invalid={!!error}
        className={cn(className)}
      />
      {error && <span className="text-sm text-danger">{error.message}</span>}
    </div>
  );
}
