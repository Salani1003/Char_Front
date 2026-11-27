import { PageHeader } from "@/components/char/page-header";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { StockCountEditor } from "@/admin/components/StockCountEditor";

/**
 * Pantalla "Nuevo recuento" (`/admin/inventory/counts/new`, permiso
 * `stock.add_stockcount`): el recuento todavía **no existe en el servidor**.
 * Se arma en pantalla con `StockCountEditor` (`count={null}`) y el primer
 * "Guardar borrador" lo crea y abre su pantalla (`StockCountPage`). "Cancelar"
 * confirma y vuelve a la lista de recuentos sin llamar al backend.
 */
export function StockCountNewPage() {
  useDocumentTitle("Nuevo recuento · Char");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nuevo recuento"
        description="Contá el stock físico y compará con el sistema. Hasta que guardes el borrador no se crea nada; las variantes que no cargues no se tocan."
      />
      <StockCountEditor count={null} canEdit />
    </div>
  );
}
