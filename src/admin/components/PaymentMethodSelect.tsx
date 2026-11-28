import { useId } from "react";
import { Label } from "@/components/char/label";
import { RadioGroup, RadioGroupItem } from "@/components/char/radio-group";
import { PAYMENT_METHOD_OPTIONS, type PaymentMethod } from "../config/sales";

/**
 * Selector del medio de pago: un grupo de opciones (`RadioGroup`, con flechas
 * del teclado) con los cinco medios del backend. Sin valor por defecto: el
 * cobro exige elegir uno (evita cobros mal registrados).
 *
 * @param value Medio elegido, o `""` si todavía no se eligió.
 * @param onChange Recibe el medio elegido.
 * @param legend Texto del grupo (por defecto "Medio de pago").
 * @param disabled Deshabilita las opciones.
 */
export function PaymentMethodSelect({
  value,
  onChange,
  legend = "Medio de pago",
  disabled,
}: {
  value: PaymentMethod | "";
  onChange: (value: PaymentMethod) => void;
  legend?: string;
  disabled?: boolean;
}) {
  const uid = useId();
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="text-sm font-medium">{legend}</legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as PaymentMethod)}
        aria-label={legend}
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {PAYMENT_METHOD_OPTIONS.map((option) => {
          const id = `${uid}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2">
              <RadioGroupItem id={id} value={option.value} />
              <Label htmlFor={id} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}
