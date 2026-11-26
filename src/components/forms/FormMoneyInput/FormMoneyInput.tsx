import type { FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { formatMoney, parseMoney } from "@/admin/utils/money";

/**
 * Campo de dinero controlado por react-hook-form: `Label` + `Input` de texto
 * con `inputmode="decimal"` que acepta formato argentino (`90.000,00`). El
 * valor del campo es **el texto escrito** (`string`); para enviarlo a la API
 * convertirlo con `parseMoney` (`"90000.00"`), nunca con floats. Al salir del
 * campo, un importe válido se reformatea (`90000` → `90.000,00`); uno inválido
 * queda como está para que la validación del formulario lo marque.
 *
 * @param label Texto sobre el campo.
 * @param description Ayuda breve bajo el campo (se oculta si hay error).
 * @param required Muestra el asterisco de obligatorio en la etiqueta.
 * @param name Nombre del campo dentro del formulario (su valor debe ser `string`).
 * @param control Instancia de `control` devuelta por `useForm`.
 * @param inputProps Resto de props nativas de `input` (placeholder, autoComplete…).
 */
export function FormMoneyInput<TFieldValues extends FieldValues>({
  label,
  description,
  required,
  name,
  control,
  rules,
  defaultValue,
  ...inputProps
}: UseControllerProps<TFieldValues> &
  Omit<
    React.ComponentProps<typeof Input>,
    "name" | "defaultValue" | "value" | "onChange" | "type"
  > & {
    label: string;
    description?: string;
    required?: boolean;
  }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });
  const hintId = `${name}-hint`;

  const handleBlur = () => {
    const parsed = parseMoney(field.value ?? "");
    if (parsed !== null) field.onChange(formatMoney(parsed).replace("$ ", ""));
    field.onBlur();
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <Input
        placeholder="0,00"
        autoComplete="off"
        {...field}
        {...inputProps}
        value={field.value ?? ""}
        onBlur={handleBlur}
        id={name}
        type="text"
        inputMode="decimal"
        aria-invalid={!!error}
        aria-describedby={description ? hintId : undefined}
      />
      {error ? (
        <span className="text-sm text-danger">{error.message}</span>
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
