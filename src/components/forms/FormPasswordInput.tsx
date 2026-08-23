import { useState } from "react";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { cn } from "@/lib/utils";
/**
 * Campo de contraseña controlado por react-hook-form, compuesto por `Label` +
 * `Input` de Char, con un botón para mostrar/ocultar el valor ingresado.
 * Muestra el mensaje de error asociado al campo cuando la validación falla.
 *
 * @param label Texto mostrado sobre el input.
 * @param name Nombre del campo dentro del formulario (debe coincidir con el schema/defaultValues).
 * @param control Instancia de `control` devuelta por `useForm`.
 * @param action Elemento opcional mostrado junto al label (ej. link "¿La olvidaste?").
 * @param className Clases adicionales para el `Input`.
 * @param inputProps Resto de props nativas de `input` (placeholder, autoComplete, etc.).
 */
export function FormPasswordInput<TFieldValues extends FieldValues>({
  label,
  name,
  control,
  rules,
  defaultValue,
  action,
  className,
  ...inputProps
}: UseControllerProps<TFieldValues> &
  Omit<React.ComponentProps<typeof Input>, "name" | "defaultValue" | "type"> & {
    label: string;
    action?: React.ReactNode;
  }) {
  const [visible, setVisible] = useState(false);
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={name}>{label}</Label>
        {action}
      </div>
      <div className="relative">
        <Input
          {...field}
          {...inputProps}
          id={name}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          className={cn("pr-8", className)}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {error && <span className="text-xs text-danger">{error.message}</span>}
    </div>
  );
}
