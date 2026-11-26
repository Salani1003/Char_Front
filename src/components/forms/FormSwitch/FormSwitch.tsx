import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { Label } from "@/components/char/label";
import { Switch } from "@/components/char/switch";

/**
 * Interruptor controlado por react-hook-form: `Label` + `Switch` de Char para
 * un campo booleano, con descripción opcional y el mensaje de error del campo.
 *
 * @param label Texto del interruptor.
 * @param description Ayuda breve bajo la etiqueta.
 * @param name Nombre del campo dentro del formulario (su valor debe ser `boolean`).
 * @param control Instancia de `control` devuelta por `useForm`.
 */
export function FormSwitch<TFieldValues extends FieldValues>({
  label,
  description,
  name,
  control,
  rules,
  defaultValue,
}: UseControllerProps<TFieldValues> & {
  label: string;
  description?: string;
}) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor={name}>{label}</Label>
          {description && (
            <span className="text-sm text-muted-foreground">{description}</span>
          )}
        </div>
        <Switch
          id={name}
          checked={!!value}
          onCheckedChange={onChange}
          onBlur={onBlur}
          aria-invalid={!!error}
          ref={ref}
        />
      </div>
      {error && <span className="text-sm text-danger">{error.message}</span>}
    </div>
  );
}
