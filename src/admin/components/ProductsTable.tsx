import { Link } from "react-router";
import { ActionsMenu } from "@/components/char/actions-menu";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductVariantsSummary } from "./ProductVariantsSummary";
import { VariantPrice } from "./VariantPrice";
import { useProductMenuItems } from "../hooks/useProductMenuItems";
import type { ProductListItem } from "../interfaces/product.interface";

/**
 * Tabla de la vista "Productos" (escritorio): nombre (enlace a la edición, con
 * categoría debajo), marca y modelo, variantes (`ProductVariantsSummary`),
 * precio vigente (`VariantPrice`, con chip de promo), estado de publicación y
 * un menú de acciones según `can` (`useProductMenuItems`). Ordenan nombre,
 * variantes y precio (las `key` son los campos de `ordering` de la API).
 * Carga con filas de esqueleto. En celulares se usa `ProductsCardList`.
 *
 * @param products Productos de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`).
 * @param onOrderingChange Se llama con el nuevo orden al hacer clic en un encabezado.
 * @param loading Muestra el esqueleto en lugar de las filas.
 * @param dimmed Atenúa las filas mientras se muestra la página anterior.
 * @param onDelete Se llama con el producto al elegir "Eliminar".
 * @param className Clases del contenedor (ej. para ocultarla en celulares).
 */
export function ProductsTable({
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

  const columns: DataTableColumn<ProductListItem>[] = [
    {
      key: "name",
      header: "Producto",
      sortable: true,
      cell: (product) => (
        <div className="flex flex-col gap-0.5">
          <Link
            to={`/admin/products/${product.id}`}
            className="w-fit rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {product.name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {product.category_label}
          </span>
        </div>
      ),
    },
    {
      key: "brand",
      header: "Marca / Modelo",
      cell: (product) =>
        product.brand_name ? (
          <div className="flex flex-col gap-0.5">
            <span>{product.brand_name}</span>
            {product.product_model_name ? (
              <span className="text-xs text-muted-foreground">
                {product.product_model_name}
              </span>
            ) : null}
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "variants_count",
      header: "Variantes",
      sortable: true,
      cell: (product) => (
        <ProductVariantsSummary
          count={product.variants_count}
          variants={product.variants}
        />
      ),
    },
    {
      key: "effective_price",
      header: "Precio vigente",
      sortable: true,
      cell: (product) => <VariantPrice variant={product} />,
    },
    {
      key: "status",
      header: "Estado",
      cell: (product) => (
        <ProductStatusBadge published={product.is_published} />
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      hideHeader: true,
      align: "right",
      className: "w-14",
      cell: (product) => {
        const items = getMenuItems(product);
        return items.length ? (
          <ActionsMenu label={`Acciones de ${product.name}`} items={items} />
        ) : null;
      },
    },
  ];

  return (
    <DataTable
      caption="Listado de productos"
      columns={columns}
      rows={products}
      getRowKey={(product) => product.id}
      ordering={ordering}
      onOrderingChange={onOrderingChange}
      loading={loading}
      dimmed={dimmed}
      className={className}
    />
  );
}
