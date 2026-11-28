import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/char/button";
import { cn } from "@/lib/utils";
import { VariantColor } from "./VariantColor";
import { formatSaleMoney, type DiscountPercent } from "../config/sales";
import type { ProductVariant } from "../interfaces/product-variant.interface";
import { centsToMoney, moneyToCents } from "../utils/money";
import {
  discountedUnitCents,
  isLastUnit,
  maxQuantity,
} from "../utils/saleCart";

/**
 * Línea del carrito del punto de venta: producto (color, talle y SKU),
 * selector de cantidad (− / + con tope en el stock conocido), precio unitario
 * estimado (con el de lista tachado si hay descuento; "promo" si la variante
 * está en promoción), subtotal estimado y "Quitar". Avisa con discreción la
 * última unidad o el stock bajo. Con `shortage` (el backend informó que no
 * alcanza) se resalta y dice "Quedan N".
 *
 * @param variant Variante de la línea.
 * @param quantity Unidades en el carrito.
 * @param discountPercent Descuento elegido (afecta el precio estimado).
 * @param shortage Unidades disponibles que informó el backend, o `null`.
 * @param onQuantityChange Recibe la nueva cantidad (el padre la acota).
 * @param onRemove Quita la línea.
 */
export function SaleCartLine({
  variant,
  quantity,
  discountPercent,
  shortage,
  onQuantityChange,
  onRemove,
}: {
  variant: ProductVariant;
  quantity: number;
  discountPercent: DiscountPercent;
  shortage: number | null;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const max = maxQuantity(variant);
  const listCents = moneyToCents(variant.current_price);
  const unitCents = discountedUnitCents(listCents, discountPercent);
  const label = `${variant.product_name} ${variant.color_name} ${variant.size_name}`;

  return (
    <li
      className={cn(
        "flex flex-col gap-2 border-b px-4 py-3 last:border-b-0",
        shortage !== null && "bg-danger/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{variant.product_name}</span>
          <span className="truncate text-xs text-muted-foreground">
            <VariantColor name={variant.color_name} hex={variant.color_hex} /> ·{" "}
            {variant.size_name} ·{" "}
            <span className="font-mono">{variant.sku}</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Quitar ${label}`}
          onClick={onRemove}
        >
          <X />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            aria-label={`Quitar una unidad de ${label}`}
            onClick={() => onQuantityChange(quantity - 1)}
          >
            <Minus />
          </Button>
          <span
            className="min-w-6 text-center font-semibold tabular-nums"
            aria-label={`Cantidad: ${quantity}`}
          >
            {quantity}
          </span>
          <Button
            variant="secondary"
            size="icon"
            aria-label={`Sumar una unidad de ${label}`}
            disabled={max !== null && quantity >= max}
            onClick={() => onQuantityChange(quantity + 1)}
          >
            <Plus />
          </Button>
        </div>
        <div className="flex flex-col items-end text-sm tabular-nums">
          <span className="font-semibold">
            {formatSaleMoney(centsToMoney(unitCents * quantity))}
          </span>
          <span className="text-xs text-muted-foreground">
            {discountPercent ? (
              <span className="line-through">
                {formatSaleMoney(variant.current_price)}
              </span>
            ) : null}{" "}
            {formatSaleMoney(centsToMoney(unitCents))} c/u
            {variant.is_on_promo ? " (promo)" : ""}
          </span>
        </div>
      </div>
      {shortage !== null ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {shortage > 0 ? `Quedan ${shortage}` : "Sin stock"}: ajustamos la
          cantidad. Revisá y volvé a cobrar.
        </p>
      ) : max !== null && quantity >= max && isLastUnit(variant) ? (
        <p className="text-xs text-warning">Es la última unidad en stock.</p>
      ) : variant.is_low_stock ? (
        <p className="text-xs text-warning">Stock bajo ({max} en stock).</p>
      ) : null}
    </li>
  );
}
