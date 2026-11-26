import { Badge } from "@/components/char/badge";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { VariantColor } from "./VariantColor";
import { VariantPrice } from "./VariantPrice";
import type { ProductVariant } from "../interfaces/product-variant.interface";

/**
 * Tabla de variantes de `CatalogPage`: SKU, producto (con categoría y marca/
 * modelo debajo), color (con muestra), talle, precio vigente (`VariantPrice`)
 * y estado de publicación. Ordena por columna con los campos de la API
 * (`sku`, `product__name`, `color__name`, `size__order`, `effective_price`);
 * el precio ordena por `effective_price`, el que se ve. Es la vista de
 * escritorio: en celulares `CatalogPage` muestra `ProductVariantsCardList`.
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
  const columns: DataTableColumn<ProductVariant>[] = [
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
          <span className="font-medium text-foreground">{v.product_name}</span>
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
