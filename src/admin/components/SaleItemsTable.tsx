import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { VariantColor } from "./VariantColor";
import { formatSaleMoney } from "../config/sales";
import type { SaleItem } from "../interfaces/sale.interface";

/**
 * Ítems de una venta: producto (color y talle), SKU, cantidad, precio de
 * lista, descuento, lo que pagó por unidad, subtotal y "Cambiadas"
 * (`exchanged_quantity` de `quantity`, "–" si ninguna). Los precios son los
 * que quedaron congelados al vender.
 *
 * @param items Ítems de la venta (`SaleDetail.items`).
 */
export function SaleItemsTable({ items }: { items: SaleItem[] }) {
  const columns: DataTableColumn<SaleItem>[] = [
    {
      key: "product",
      header: "Producto",
      cell: (i) => (
        <div className="flex flex-col">
          <span className="font-medium">{i.product_name}</span>
          <span className="text-xs text-muted-foreground">
            <VariantColor name={i.color_name} hex={i.color_hex} /> ·{" "}
            {i.size_name}
          </span>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      cell: (i) => <span className="font-mono text-xs">{i.sku}</span>,
    },
    {
      key: "quantity",
      header: "Cant.",
      align: "right",
      cell: (i) => <span className="tabular-nums">{i.quantity}</span>,
    },
    {
      key: "list_price",
      header: "Precio lista",
      align: "right",
      cell: (i) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatSaleMoney(i.list_price)}
        </span>
      ),
    },
    {
      key: "discount",
      header: "Desc.",
      align: "right",
      cell: (i) => (
        <span className="tabular-nums">
          {i.discount_percent ? `${i.discount_percent} %` : "–"}
        </span>
      ),
    },
    {
      key: "unit_price",
      header: "Pagó c/u",
      align: "right",
      cell: (i) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatSaleMoney(i.unit_price)}
        </span>
      ),
    },
    {
      key: "subtotal",
      header: "Subtotal",
      align: "right",
      cell: (i) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {formatSaleMoney(i.subtotal)}
        </span>
      ),
    },
    {
      key: "exchanged",
      header: "Cambiadas",
      align: "right",
      cell: (i) => (
        <span className="whitespace-nowrap tabular-nums">
          {i.exchanged_quantity
            ? `${i.exchanged_quantity} de ${i.quantity}`
            : "–"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      caption="Ítems de la venta"
      columns={columns}
      rows={items}
      getRowKey={(i) => i.id}
    />
  );
}
