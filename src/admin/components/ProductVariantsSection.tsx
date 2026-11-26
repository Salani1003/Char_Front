import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Can } from "@/auth/components/Can";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { Button } from "@/components/char/button";
import { DataTable, type DataTableColumn } from "@/components/char/data-table";
import { Notice } from "@/components/char/notice";
import { StateMessage } from "@/components/char/state-message";
import type {
  Product,
  ProductVariantItem,
} from "../interfaces/product.interface";
import { ProductVariantDeleteDialog } from "./ProductVariantDeleteDialog";
import { ProductVariantsPanel } from "./ProductVariantsPanel";
import { VariantColor } from "./VariantColor";

/**
 * Contenido de la pestaña "Variantes" de un producto: encabezado con
 * "+ Agregar variantes", aviso si el producto está publicado, el panel
 * "Agregar variantes" (en la página, arriba de la tabla) y la tabla (SKU,
 * Color con muestra del tono, Talle y Stock "—" hasta que se defina el manejo
 * de stock) con una acción **Eliminar** por fila. Las variantes llegan ya
 * ordenadas por color y talle de `GET /products/:id/with-variants/`.
 *
 * - "+ Agregar variantes" solo con `add_productvariant`; queda deshabilitada
 *   mientras el panel está abierto.
 * - Eliminar (`aria-label="Eliminar variante CHAR-0001"`) solo con
 *   `delete_productvariant`; confirma en `ProductVariantDeleteDialog`.
 * - Sin variantes muestra el estado vacío "Este producto todavía no tiene
 *   variantes."
 *
 * @param product Producto (su `is_published` decide el aviso).
 * @param variants Variantes activas del producto.
 */
export function ProductVariantsSection({
  product,
  variants,
}: {
  product: Product;
  variants: ProductVariantItem[];
}) {
  const can = useCan();
  const canDelete = can(PERMISSIONS.products.productVariant.delete);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ProductVariantItem | null>(null);

  const columns: DataTableColumn<ProductVariantItem>[] = [
    { key: "sku", header: "SKU", cell: (v) => v.sku },
    {
      key: "color",
      header: "Color",
      cell: (v) =>
        v.color.hex ? (
          <VariantColor name={v.color.name} hex={v.color.hex} />
        ) : (
          v.color.name
        ),
    },
    { key: "size", header: "Talle", cell: (v) => v.size.name },
    { key: "stock", header: "Stock", cell: () => "—" },
    ...(canDelete
      ? [
          {
            key: "actions",
            header: "Acciones",
            hideHeader: true,
            align: "right" as const,
            cell: (v: ProductVariantItem) => (
              <Button
                type="button"
                variant="ghost-danger"
                size="icon"
                aria-label={`Eliminar variante ${v.sku}`}
                onClick={() => setToDelete(v)}
              >
                <Trash2 />
              </Button>
            ),
          },
        ]
      : []),
  ];

  const addButton = (
    <Can permission={PERMISSIONS.products.productVariant.add}>
      <Button
        type="button"
        variant="magenta"
        disabled={panelOpen}
        onClick={() => setPanelOpen(true)}
      >
        <Plus /> Agregar variantes
      </Button>
    </Can>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-medium">Variantes</h2>
        {addButton}
      </div>

      {product.is_published ? (
        <Notice variant="warning">
          Este producto está publicado. Podés eliminar variantes, pero no la
          última: para eso primero hay que despublicarlo.
        </Notice>
      ) : null}

      {panelOpen ? (
        <ProductVariantsPanel
          productId={product.id}
          existing={variants}
          onClose={() => setPanelOpen(false)}
        />
      ) : null}

      {variants.length === 0 ? (
        <StateMessage variant="empty">
          Este producto todavía no tiene variantes.
        </StateMessage>
      ) : (
        <>
          <DataTable
            caption="Variantes del producto"
            columns={columns}
            rows={variants}
            getRowKey={(v) => v.id}
          />
          <p className="text-sm text-muted-foreground">
            La columna Stock se completa cuando se defina el manejo de stock.
          </p>
        </>
      )}

      <ProductVariantDeleteDialog
        variant={toDelete}
        productId={product.id}
        productPublished={product.is_published}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
