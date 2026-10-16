import { useId } from "react";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { Checkbox } from "@/components/char/checkbox";
import { Label } from "@/components/char/label";

export interface CheckboxGroupOption {
  value: number;
  label: string;
}

/**
 * Grupo de checkboxes controlado por react-hook-form. El valor del campo es
 * un arreglo con los `value` de las opciones tildadas (ej. `[1, 3]`). Muestra
 * el mensaje de error asociado al campo cuando la validación falla.
 *
 * @param label Texto del grupo, mostrado sobre las opciones.
 * @param name Nombre del campo dentro del formulario (su valor debe ser `number[]`).
 * @param control Instancia de `control` devuelta por `useForm`.
 * @param options Opciones disponibles (`value` numérico + `label`).
 * @param emptyMessage Texto mostrado si no hay opciones.
 */
export function FormCheckboxGroup<TFieldValues extends FieldValues>({
  label,
  name,
  control,
  rules,
  defaultValue,
  options,
  emptyMessage = "No hay opciones disponibles.",
}: UseControllerProps<TFieldValues> & {
  label: string;
  options: CheckboxGroupOption[];
  emptyMessage?: string;
}) {
  const id = useId();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });
  const selected: number[] = field.value ?? [];

  const toggle = (value: number, checked: boolean) => {
    field.onChange(
      checked ? [...selected, value] : selected.filter((v) => v !== value),
    );
  };

  return (
    <fieldset className="flex w-full flex-col">
      <legend className="mb-3 text-sm font-medium text-foreground">
        {label}
      </legend>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="flex flex-wrap gap-x-6 gap-y-2.5">
          {options.map((option) => {
            const optionId = `${id}-${option.value}`;
            return (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  id={optionId}
                  checked={selected.includes(option.value)}
                  onCheckedChange={(checked) => toggle(option.value, checked)}
                  onBlur={field.onBlur}
                />
                <Label htmlFor={optionId} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      )}
      {error && <span className="text-sm text-danger">{error.message}</span>}
    </fieldset>
  );
}
