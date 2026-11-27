import { useState } from "react";
import { Input } from "@/components/char/input";
import { toast } from "@/components/char/sonner";
import { toApiError } from "@/lib/apiError";
import { useUpdateMinStock } from "../hooks/useStock";
import { parseMinStock } from "../utils/stock";
import type { StockLevel } from "../interfaces/stock.interface";

/**
 * Campo del stock mínimo de una variante (umbral de reposición). Se guarda al
 * salir del campo o con Enter (`PATCH /product-variants/:id/`), solo si el
 * valor cambió. Un valor inválido (vacío, decimal o negativo) se descarta con
 * un aviso y el campo vuelve al valor guardado; un error del backend también.
 * Sin `disabled` queda de solo lectura (rol sin `products.change_productvariant`).
 *
 * Es un campo no controlado desde afuera: el padre le pone `key` con el valor
 * guardado para que se reinicie cuando el listado se refresca.
 *
 * @param level Variante (usa `id`, `min_stock`, `sku` y los datos para la etiqueta).
 * @param disabled Deshabilita la edición.
 */
export function StockMinInput({
  level,
  disabled,
}: {
  level: StockLevel;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(level.min_stock));
  const { mutate, isPending } = useUpdateMinStock();

  const revert = () => setDraft(String(level.min_stock));

  const commit = () => {
    const value = parseMinStock(draft);
    if (value === null) {
      revert();
      toast.error("El stock mínimo debe ser un número entero, 0 o mayor.");
      return;
    }
    if (value === level.min_stock) {
      setDraft(String(value));
      return;
    }
    mutate(
      { id: level.id, minStock: value },
      {
        onSuccess: () => toast.success("Stock mínimo actualizado"),
        onError: (error) => {
          revert();
          toast.error(toApiError(error).message);
        },
      },
    );
  };

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={0}
      size="sm"
      className="ml-auto w-20 text-right tabular-nums"
      aria-label={`Stock mínimo de ${level.sku}`}
      value={draft}
      disabled={disabled || isPending}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          revert();
          event.currentTarget.blur();
        }
      }}
    />
  );
}
