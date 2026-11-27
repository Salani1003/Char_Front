import { Link } from "react-router";
import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { Button } from "@/components/char/button";
import { StockMinInput } from "./StockMinInput";
import { StockPhoto } from "./StockPhoto";
import { StockStatusBadge } from "./StockStatusBadge";
import { VariantColor } from "./VariantColor";
import { newMovementPath } from "../utils/stock";
import type { StockLevel } from "../interfaces/stock.interface";

/**
 * Tabla de saldos de `InventoryPage`: producto (con categoría y marca), SKU,
 * foto (solo con `products.view_productimage`), color, talle, stock, mínimo editable (`StockMinInput`; solo con
 * `products.change_productvariant`) y estado. Ordena por columna con los
 * campos de la API (`product__name`, `sku`, `color__name`, `size__order`,
 * `quantity`, `min_stock`). Es la vista de escritorio: en celulares se
 * muestra `StockCardList`.
 *
 * @param levels Saldos de la página actual.
 * @param ordering Orden actual (`campo` o `-campo`; vacío = el del backend).
 * @param onOrderingChange Se llama con el nuevo orden al hacer clic en un encabezado.
 * @param loading Muestra el esqueleto en lugar de las filas.
 * @param dimmed Atenúa las filas mientras se muestra la página anterior.
 * @param className Clases del contenedor (ej. para ocultarla en celulares).
 */
export function StockTable({
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
  const columns: DataTableColumn<StockLevel>[] = [
    ...(canViewImages
      ? [
          {
            key: "photo",
            header: "Foto",
            cell: (l: StockLevel) => <StockPhoto level={l} />,
          },
        ]
      : []),
    {
      key: "product__name",
      header: "Producto",
      sortable: true,
      cell: (l) => (
        <div className="flex flex-col">
          <span className="font-medium">{l.product_name}</span>
          <span className="text-xs text-muted-foreground">
            {[l.category_label, l.brand_name].filter(Boolean).join(" · ")}
          </span>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      cell: (l) => <span className="font-mono text-xs">{l.sku}</span>,
    },
    {
      key: "color__name",
      header: "Color",
      sortable: true,
      cell: (l) => <VariantColor name={l.color_name} hex={l.color_hex} />,
    },
    {
      key: "size__order",
      header: "Talle",
      sortable: true,
      cell: (l) => l.size_name,
    },
    {
      key: "quantity",
      header: "Stock",
      sortable: true,
      align: "right",
      cell: (l) => <span className="font-bold tabular-nums">{l.quantity}</span>,
    },
    {
      key: "min_stock",
      header: "Mínimo",
      sortable: true,
      align: "right",
      cell: (l) => (
        <StockMinInput
          key={`${l.id}-${l.min_stock}`}
          level={l}
          disabled={!canEditMin}
        />
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (l) => <StockStatusBadge level={l} />,
    },
    ...(canMove
      ? [
          {
            key: "actions",
            header: "Movimientos",
            hideHeader: true,
            cell: (l: StockLevel) => (
              <span className="inline-flex gap-2 whitespace-nowrap">
                <Button
                  variant="secondary"
                  size="sm"
                  render={<Link to={newMovementPath(l.id, "ingreso")} />}
                  nativeButton={false}
                  aria-label={`Registrar ingreso de ${l.sku}`}
                >
                  + Ingreso
                </Button>
                {l.quantity > 0 ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    render={<Link to={newMovementPath(l.id, "egreso")} />}
                    nativeButton={false}
                    aria-label={`Registrar egreso de ${l.sku}`}
                  >
                    − Egreso
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled
                    aria-label={`Registrar egreso de ${l.sku} (sin stock)`}
                  >
                    − Egreso
                  </Button>
                )}
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      caption="Saldo de stock por variante"
      columns={columns}
      rows={levels}
      getRowKey={(l) => l.id}
      ordering={ordering}
      onOrderingChange={onOrderingChange}
      loading={loading}
      dimmed={dimmed}
      className={className}
    />
  );
}
