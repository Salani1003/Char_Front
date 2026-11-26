import type { ReactNode } from "react";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { Combobox } from "@/components/char/combobox";
import type { ComboboxProps } from "@/components/char/combobox";
import { Label } from "@/components/char/label";

/** Lo que `FormCombobox` entrega a su render-prop `children`. */
export interface FormComboboxControl {
  /** Valor actual del campo del formulario. */
  value: unknown;
  /** Actualiza el campo del formulario. */
  onChange: (value: unknown) => void;
  onBlur: () => void;
  /** `id` del input (el `htmlFor` del label). */
  id: string;
  /** `true` si el campo tiene error de validación. */
  error: boolean;
  /** `id` de la ayuda/error asociada (para `aria-describedby`). */
  "aria-describedby"?: string;
}

/**
 * Autocompletado controlado por react-hook-form, compuesto por `Label` +
 * `Combobox` de Char. Muestra el error del campo (o, si no hay, la
 * descripción) bajo el control, igual que `FormInput`/`FormSelect`.
 *
 * Por defecto el valor del campo **es la opción elegida** (`T | null`). Para
 * guardar otra cosa (p. ej. solo el `id`, como hacen `CategoryCombobox`,
 * `BrandCombobox` y `ProductModelCombobox`) pasar `children`: una función
 * que recibe `FormComboboxControl` y devuelve el control ya cableado.
 *
 * @param label Texto sobre el campo.
 * @param description Ayuda breve bajo el campo (se oculta si hay error).
 * @param required Marca el label como obligatorio.
 * @param name Nombre del campo dentro del formulario.
 * @param control Instancia de `control` devuelta por `useForm`.
 * @param children Render-prop opcional que reemplaza al `Combobox` por defecto.
 * @param comboboxProps Resto de props de `Combobox` (`options`, `getOptionLabel`, …) cuando no se usa `children`.
 */
export function FormCombobox<
  TFieldValues extends FieldValues,
  TOption = never,
>({
  label,
  description,
  required,
  name,
  control,
  rules,
  defaultValue,
  children,
  ...comboboxProps
}: UseControllerProps<TFieldValues> & {
  label: string;
  description?: string;
  required?: boolean;
  children?: (field: FormComboboxControl) => ReactNode;
} & Partial<
    Omit<
      ComboboxProps<TOption>,
      "value" | "onChange" | "error" | "id" | "name" | "onBlur"
    >
  >) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;
  const describedBy = error ? errorId : description ? hintId : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      {children ? (
        children({
          value: field.value,
          onChange: field.onChange,
          onBlur: field.onBlur,
          id: name,
          error: !!error,
          "aria-describedby": describedBy,
        })
      ) : (
        <Combobox<TOption>
          {...(comboboxProps as ComboboxProps<TOption>)}
          id={name}
          name={name}
          value={(field.value ?? null) as TOption | null}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={!!error}
          aria-describedby={describedBy}
        />
      )}
      {error ? (
        <span id={errorId} className="text-sm text-danger">
          {error.message}
        </span>
      ) : (
        description && (
          <span id={hintId} className="text-sm text-muted-foreground">
            {description}
          </span>
        )
      )}
    </div>
  );
}
