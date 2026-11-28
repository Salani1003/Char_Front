import { DataTable } from "@/components/char/data-table";
import type { DataTableColumn } from "@/components/char/data-table";
import { VariantColor } from "./VariantColor";
import { formatSaleMoney } from "../config/sales";
import type { ExchangeItem } from "../interfaces/exchange.interface";

/**
 * Líneas de un cambio de una misma dirección ("Devuelve" o "Se lleva"):
 * producto (color y talle), SKU, cantidad, precio unitario (lo que pagó al
 * devolver; el vigente hoy al llevarse) y subtotal.
 *
 * @param items Líneas ya filtradas por dirección.
 * @param caption Descripción accesible de la tabla.
 */
export function ExchangeItemsTable({
  items,
  caption,
}: {
  items: ExchangeItem[];
  caption: string;
}) {
  const columns: DataTableColumn<ExchangeItem>[] = [
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
      key: "unit_price",
      header: "Precio c/u",
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
  ];

  return (
    <DataTable
      caption={caption}
      columns={columns}
      rows={items}
      getRowKey={(i) => i.id}
    />
  );
}
