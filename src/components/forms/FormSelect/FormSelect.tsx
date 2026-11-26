import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { Label } from "@/components/char/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";

export interface SelectOption {
  value: string;
  label: string;
  /** Si es `true` la opción se ve pero no se puede elegir. */
  disabled?: boolean;
}

/**
 * Desplegable de selección única controlado por react-hook-form, compuesto por
 * `Label` + `Select` de Char. El valor del campo es el `value` (string) de la
 * opción elegida, o `""` si no hay ninguna (se muestra el `placeholder`).
 * Muestra el mensaje de error del campo cuando la validación falla.
 *
 * @param label Texto mostrado sobre el desplegable.
 * @param name Nombre del campo dentro del formulario (su valor debe ser `string`).
 * @param control Instancia de `control` devuelta por `useForm`.
 * @param options Opciones disponibles (`value` + `label`; `disabled` las muestra sin permitir elegirlas).
 * @param placeholder Texto mostrado mientras no hay una opción elegida.
 */
export function FormSelect<TFieldValues extends FieldValues>({
  label,
  name,
  control,
  rules,
  defaultValue,
  options,
  placeholder = "Seleccioná una opción",
}: UseControllerProps<TFieldValues> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
}) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });
  const items = Object.fromEntries(options.map((o) => [o.value, o.label]));

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Select
        items={items}
        value={value || null}
        onValueChange={(next) => onChange(next ?? "")}
      >
        <SelectTrigger
          id={name}
          onBlur={onBlur}
          aria-invalid={!!error}
          className="w-full"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <span className="text-sm text-danger">{error.message}</span>
      ) : null}
    </div>
  );
}
