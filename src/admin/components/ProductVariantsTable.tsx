import { Link } from "react-router";
import { Badge } from "@/components/char/badge";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { StockStatusBadge } from "./StockStatusBadge";
import { VariantColor } from "./VariantColor";
import { VariantPhoto } from "./VariantPhoto";
import { VariantPrice } from "./VariantPrice";
import { VariantStock } from "./VariantStock";
import type { ProductVariant } from "../interfaces/product-variant.interface";

/**
 * Tabla de variantes de `ProductsPage`: Foto (miniatura de la principal del color, solo con `view_productimage`), SKU, producto (enlace a su edición, con categoría y marca/
 * modelo debajo), color (con muestra), talle, precio vigente (`VariantPrice`),
 * stock (una sola columna: `VariantStock` + `StockStatusBadge` —Sin stock / Stock bajo / En stock—, a la derecha del precio, ordenable por `quantity`; solo con `stock.view_stocklevel`)
 * y estado de publicación. Ordena por columna con los campos de la API
 * (`sku`, `product__name`, `color__name`, `size__order`, `effective_price`, `quantity`);
 * el precio ordena por `effective_price`, el que se ve. Es la vista de
 * escritorio: en celulares `ProductsPage` muestra `ProductVariantsCardList`.
 *
 * @param variants Variantes de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = el del backend).
 * @param onOrderingChange Se llama con el nuevo orden al hacer clic en un encabezado.
 * @param loading Muestra el esqueleto en lugar de las filas.
 * @param dimmed Atenúa las filas mientras se muestra la página anterior.
 * @param className Clases del contenedor (ej. para ocultarla en celulares).
 */
export function ProductVariantsTable({
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
  const can = useCan();
  const canViewImages = can(PERMISSIONS.products.productImage.view);
  const canViewStock = can(PERMISSIONS.stock.level.view);
  const columns: DataTableColumn<ProductVariant>[] = [
    ...(canViewImages
      ? [
          {
            key: "photo",
            header: "Foto",
            cell: (v: ProductVariant) => <VariantPhoto variant={v} />,
          },
        ]
      : []),
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      cell: (v) => <span className="font-mono text-xs">{v.sku}</span>,
    },
    {
      key: "product__name",
      header: "Producto",
      sortable: true,
      cell: (v) => (
        <div className="flex flex-col">
          <Link
            to={`/admin/products/${v.product}`}
            className="w-fit rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {v.product_name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {[v.category_label, v.brand_name, v.product_model_name]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
      ),
    },
    {
      key: "color__name",
      header: "Color",
      sortable: true,
      cell: (v) => <VariantColor name={v.color_name} hex={v.color_hex} />,
    },
    {
      key: "size__order",
      header: "Talle",
      sortable: true,
      cell: (v) => v.size_name,
    },
    {
      key: "effective_price",
      header: "Precio",
      sortable: true,
      cell: (v) => <VariantPrice variant={v} />,
    },
    ...(canViewStock
      ? [
          {
            key: "quantity",
            header: "Stock",
            sortable: true,
            cell: (v: ProductVariant) => (
              <span className="inline-flex items-center gap-3">
                <VariantStock variant={v} />
                {v.quantity !== undefined ? (
                  <StockStatusBadge
                    level={{
                      quantity: v.quantity,
                      is_low_stock: v.is_low_stock ?? false,
                    }}
                  />
                ) : null}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "is_published",
      header: "Estado",
      cell: (v) => (
        <Badge variant={v.is_published ? "success" : "secondary"}>
          {v.is_published ? "Publicado" : "Borrador"}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      caption="Listado de variantes del catálogo"
      columns={columns}
      rows={variants}
      getRowKey={(v) => v.id}
      ordering={ordering}
      onOrderingChange={onOrderingChange}
      loading={loading}
      dimmed={dimmed}
      className={className}
    />
  );
}
