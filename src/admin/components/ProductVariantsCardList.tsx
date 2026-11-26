import { Link } from "react-router";
import { ArrowDown, ArrowUp, Palette, Ruler, Tag } from "lucide-react";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import { EntityCard } from "@/components/char/entity-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { cn } from "@/lib/utils";
import { UsersListSkeleton } from "./UsersListSkeleton";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { VariantColor } from "./VariantColor";
import { VariantPrice } from "./VariantPrice";
import type { ProductVariant } from "../interfaces/product-variant.interface";

/** Campos de orden y su etiqueta (claves = campos de la API). */
const ORDER_FIELDS: Record<string, string> = {
  product__name: "Producto",
  sku: "SKU",
  color__name: "Color",
  size__order: "Talle",
  effective_price: "Precio",
  created_at: "Fecha de alta",
};

/**
 * Listado de variantes en tarjetas para celulares: alternativa a
 * `ProductVariantsTable` (la pantalla muestra una u otra según el ancho). Como
 * no hay encabezados donde hacer clic, incluye "Ordenar por" (campo) y un
 * botón que alterna ascendente / descendente. Sin orden elegido (el del
 * backend) el campo aparece como "Producto" ascendente. Cubre la carga con el
 * esqueleto de tarjetas.
 *
 * @param variants Variantes de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = el del backend).
 * @param onOrderingChange Se llama con el nuevo orden.
 * @param loading Muestra el esqueleto en lugar de las tarjetas.
 * @param dimmed Atenúa las tarjetas mientras se muestra la página anterior.
 * @param className Clases del contenedor.
 */
export function ProductVariantsCardList({
  variants,
  ordering,
  onOrderingChange,
  loading,
  dimmed,
  className,
}: {
  variants: ProductVariant[];
  ordering: string;
  onOrderingChange: (ordering: string) => void;
  loading?: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const canViewImages = useCan()(PERMISSIONS.products.productImage.view);
  const descending = ordering.startsWith("-");
  const field = ordering.replace(/^-/, "") || "product__name";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <span id="catalog-order-label" className="text-sm font-medium">
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
            aria-labelledby="catalog-order-label"
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
          <span className="sr-only">Cargando variantes…</span>
          <UsersListSkeleton count={4} />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2",
            dimmed && "opacity-60",
          )}
        >
          {variants.map((v) => (
            <EntityCard
              key={v.id}
              title={v.product_name}
              avatar={
                canViewImages && (v.thumbnail_url ?? v.image_url) ? (
                  <img
                    src={(v.thumbnail_url ?? v.image_url) as string}
                    alt=""
                    className="size-full rounded-full object-cover"
                  />
                ) : undefined
              }
              subtitle={`${v.sku} · ${v.category_label}`}
              badge={
                <Badge variant={v.is_published ? "success" : "secondary"}>
                  {v.is_published ? "Publicado" : "Borrador"}
                </Badge>
              }
              details={[
                {
                  icon: <Palette />,
                  label: "Color",
                  value: <VariantColor name={v.color_name} hex={v.color_hex} />,
                },
                { icon: <Ruler />, label: "Talle", value: v.size_name },
                {
                  icon: <Tag />,
                  label: "Precio",
                  value: <VariantPrice variant={v} />,
                },
              ]}
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  render={<Link to={`/admin/products/${v.product}`} />}
                  nativeButton={false}
                  aria-label={`Ver producto ${v.product_name}`}
                >
                  Ver producto
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
