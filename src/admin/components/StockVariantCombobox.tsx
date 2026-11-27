import { Combobox } from "@/components/char/combobox";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { StockPhoto } from "./StockPhoto";
import { useComboboxSearch } from "../hooks/useComboboxSearch";
import { useStock } from "../hooks/useStock";
import { stockLevelLabel } from "../utils/stock";
import type { StockLevel } from "../interfaces/stock.interface";

/**
 * Autocompletado de variante para el formulario de movimiento. Pide
 * `GET /stock/?search=…` (SKU, producto, marca, color o talle; retraso de
 * 250 ms), así cada opción trae su `quantity` actual: lo que el formulario
 * muestra como "Stock actual" y usa para validar un egreso. Cada opción de la
 * lista muestra la foto de la variante (con `products.view_productimage`), el
 * producto, color y talle, y el SKU con su stock. `onChange`
 * entrega el saldo completo (o `null` al quitarlo).
 *
 * @param value Saldo elegido, o `null`.
 * @param onChange Saldo elegido o `null`.
 * @param error Mensaje de error del renglón (marca el campo como inválido).
 * @param aria-label Nombre accesible del campo.
 */
export function StockVariantCombobox({
  value,
  onChange,
  error,
  disabled,
  ...rest
}: {
  value: StockLevel | null;
  onChange: (level: StockLevel | null) => void;
  error?: boolean | string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  const { setQuery, search, pending } = useComboboxSearch();
  const canViewImages = useCan()(PERMISSIONS.products.productImage.view);
  const list = useStock({ search, page_size: 20 });

  return (
    <Combobox<StockLevel>
      {...rest}
      value={value}
      onChange={onChange}
      options={list.data?.results ?? []}
      getOptionKey={(l) => l.id}
      getOptionLabel={stockLevelLabel}
      renderOption={(level) => (
        <span className="flex min-w-0 flex-1 items-center gap-3 py-0.5">
          {canViewImages ? (
            <StockPhoto level={level} className="size-10" />
          ) : null}
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium">
              {level.product_name} · {level.color_name} · {level.size_name}
            </span>
            <span className="truncate font-mono text-xs text-muted-foreground">
              {level.sku} · Stock {level.quantity}
            </span>
          </span>
        </span>
      )}
      onInputChange={setQuery}
      loading={list.isFetching || pending}
      placeholder="Buscá por SKU, producto, color o talle"
      clearable
      clearLabel="Quitar variante"
      disabled={disabled}
      error={error}
      emptyMessage={(q) =>
        q ? `No hay variantes que coincidan con «${q}»` : "No hay variantes"
      }
    />
  );
}
