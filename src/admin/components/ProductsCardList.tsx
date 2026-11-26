import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/char/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { UsersListSkeleton } from "./UsersListSkeleton";
import { useProductMenuItems } from "../hooks/useProductMenuItems";
import type { ProductListItem } from "../interfaces/product.interface";

/** Campos de orden y su etiqueta (claves = campos de `ordering` de la API). */
const ORDER_FIELDS: Record<string, string> = {
  created_at: "Fecha de alta",
  name: "Nombre",
  effective_price: "Precio vigente",
  sale_price: "Precio de venta",
  variants_count: "Cantidad de variantes",
};

/**
 * Vista "Productos" en tarjetas para celulares: alternativa a `ProductsTable`
 * (la pantalla muestra una u otra según el ancho). Incluye un control de orden
 * (campo + botón ascendente/descendente, convención `campo` / `-campo` de DRF)
 * porque las tarjetas no tienen encabezados; sin orden elegido muestra "Fecha
 * de alta" (el orden real lo define el backend). Carga con el esqueleto de
 * tarjetas (`UsersListSkeleton`).
 *
 * @param products Productos de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = el del backend).
 * @param onOrderingChange Se llama con el nuevo orden.
 * @param loading Muestra el esqueleto en lugar de las tarjetas.
 * @param dimmed Atenúa las tarjetas mientras se muestra la página anterior.
 * @param onDelete Se llama con el producto al elegir "Eliminar".
 */
export function ProductsCardList({
  products,
  ordering,
  onOrderingChange,
  loading,
  dimmed,
  onDelete,
  className,
}: {
  products: ProductListItem[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  loading?: boolean;
  dimmed?: boolean;
  onDelete: (product: ProductListItem) => void;
  className?: string;
}) {
  const getMenuItems = useProductMenuItems({ onDelete });
  const descending = ordering.startsWith("-");
  const field = ordering.replace(/^-/, "") || "created_at";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <span id="products-order-label" className="text-sm font-medium">
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
            aria-labelledby="products-order-label"
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
          <span className="sr-only">Cargando productos…</span>
          <UsersListSkeleton count={4} />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2",
            dimmed && "opacity-60",
          )}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              menuItems={getMenuItems(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
