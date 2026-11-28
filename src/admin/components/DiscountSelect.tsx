import { RadioGroup, RadioGroupItem } from "@/components/char/radio-group";
import { Label } from "@/components/char/label";
import { useId } from "react";
import { DISCOUNT_OPTIONS, type DiscountPercent } from "../config/sales";

/**
 * Selector del descuento a toda la venta: Sin / 5 % / 10 %. Quien lo renderiza
 * decide si mostrarlo: solo es para quien tiene `sales.apply_discount` (sin el
 * permiso el backend responde 403).
 *
 * @param value Descuento elegido.
 * @param onChange Recibe el descuento elegido.
 * @param disabled Deshabilita las opciones.
 */
export function DiscountSelect({
  value,
  onChange,
  disabled,
}: {
  value: DiscountPercent;
  onChange: (value: DiscountPercent) => void;
  disabled?: boolean;
}) {
  const uid = useId();
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="text-sm font-medium">Descuento</legend>
      <RadioGroup
        value={String(value)}
        onValueChange={(next) => onChange(Number(next) as DiscountPercent)}
        aria-label="Descuento"
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {DISCOUNT_OPTIONS.map((option) => {
          const id = `${uid}-${option}`;
          return (
            <div key={option} className="flex items-center gap-2">
              <RadioGroupItem id={id} value={String(option)} />
              <Label htmlFor={id} className="cursor-pointer">
                {option === 0 ? "Sin descuento" : `${option} %`}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}
