import { Link } from "react-router";
import { ArrowDown, ArrowUp, Palette, Ruler } from "lucide-react";
import { Button } from "@/components/char/button";
import { EntityCard } from "@/components/char/entity-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { cn } from "@/lib/utils";
import { newMovementPath } from "../utils/stock";
import { StockMinInput } from "./StockMinInput";
import { StockPhoto } from "./StockPhoto";
import { StockStatusBadge } from "./StockStatusBadge";
import { UsersListSkeleton } from "./UsersListSkeleton";
import { VariantColor } from "./VariantColor";
import type { StockLevel } from "../interfaces/stock.interface";

/** Campos de orden y su etiqueta (claves = campos de la API). */
const ORDER_FIELDS: Record<string, string> = {
  product__name: "Producto",
  quantity: "Stock",
  min_stock: "Mínimo",
  sku: "SKU",
  color__name: "Color",
  size__order: "Talle",
};

/**
 * Listado de saldos en tarjetas para celulares: alternativa a `StockTable`
 * (la pantalla muestra una u otra según el ancho). Como no hay encabezados
 * donde hacer clic, incluye "Ordenar por" (campo) y un botón que alterna
 * ascendente / descendente. Sin orden elegido el campo aparece como
 * "Producto" ascendente. Cada tarjeta muestra color, talle, stock, el mínimo
 * editable (`StockMinInput`) y el estado.
 *
 * @param levels Saldos de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = el del backend).
 * @param onOrderingChange Se llama con el nuevo orden.
 * @param loading Muestra el esqueleto en lugar de las tarjetas.
 * @param dimmed Atenúa las tarjetas mientras se muestra la página anterior.
 * @param className Clases del contenedor.
 */
export function StockCardList({
  levels,
  ordering,
  onOrderingChange,
  loading,
  dimmed,
  className,
}: {
  levels: StockLevel[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  loading?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const can = useCan();
  const canEditMin = can(PERMISSIONS.products.productVariant.change);
  const canMove = can(PERMISSIONS.stock.movement.add);
  const canViewImages = can(PERMISSIONS.products.productImage.view);
  const descending = ordering.startsWith("-");
  const field = ordering.replace(/^-/, "") || "product__name";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <span id="stock-order-label" className="text-sm font-medium">
          Ordenar por
        </span>
        <Select
          items={ORDER_FIELDS}
          value={field}
          onValueChange={(next) =>
            onOrderingChange(descending ? `-${next}` : String(next))
          }
        >
          <SelectTrigger
            size="sm"
            className="min-w-0 flex-1"
            aria-labelledby="stock-order-label"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ORDER_FIELDS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          size="icon"
          aria-label={
            descending
              ? "Orden descendente, cambiar a ascendente"
              : "Orden ascendente, cambiar a descendente"
          }
          onClick={() => onOrderingChange(descending ? field : `-${field}`)}
        >
          {descending ? <ArrowDown /> : <ArrowUp />}
        </Button>
      </div>
      {loading ? (
        <div role="status">
          <span className="sr-only">Cargando stock…</span>
          <UsersListSkeleton count={4} />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2",
            dimmed && "opacity-60",
          )}
        >
          {levels.map((l) => (
            <EntityCard
              key={l.id}
              title={l.product_name}
              avatar={
                canViewImages ? (
                  <StockPhoto level={l} className="size-full rounded-full" />
                ) : undefined
              }
              subtitle={`${l.sku} · ${l.category_label}`}
              badge={<StockStatusBadge level={l} />}
              details={[
                {
                  icon: <Palette />,
                  label: "Color",
                  value: <VariantColor name={l.color_name} hex={l.color_hex} />,
                },
                { icon: <Ruler />, label: "Talle", value: l.size_name },
                {
                  label: "Stock",
                  value: (
                    <span className="font-bold tabular-nums">{l.quantity}</span>
                  ),
                },
                {
                  label: "Mínimo",
                  value: (
                    <StockMinInput
                      key={`${l.id}-${l.min_stock}`}
                      level={l}
                      disabled={!canEditMin}
                    />
                  ),
                },
              ]}
              actions={
                canMove ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      render={<Link to={newMovementPath(l.id, "ingreso")} />}
                      nativeButton={false}
                      aria-label={`Registrar ingreso de ${l.sku}`}
                    >
                      + Ingreso
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={l.quantity === 0}
                      render={
                        l.quantity > 0 ? (
                          <Link to={newMovementPath(l.id, "egreso")} />
                        ) : undefined
                      }
                      nativeButton={l.quantity === 0}
                      aria-label={`Registrar egreso de ${l.sku}`}
                    >
                      − Egreso
                    </Button>
                  </>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
