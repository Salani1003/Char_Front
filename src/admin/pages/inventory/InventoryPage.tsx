import { Link, useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import { Can } from "@/auth/components/Can";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { Button } from "@/components/char/button";
import { PageHeader } from "@/components/char/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/char/tabs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { NewStockCountButton } from "@/admin/components/NewStockCountButton";
import { StockCountsList } from "./StockCountsList";
import { StockHistoryList } from "./StockHistoryList";
import { StockList } from "./StockList";

type InventoryView = "stock" | "history" | "counts";

/**
 * Pantalla de Inventario (`/admin/inventory`, permiso `stock.view_stocklevel`):
 * encabezado con "Nuevo movimiento" (`stock.add_stockmovement`; en Recuentos solo "Nuevo recuento") y un selector
 * de vista, `components/char/tabs`:
 *
 * - **Stock** (por defecto): saldo por variante — `StockList`.
 * - **Historial** (solo con `stock.view_stockmovement`): una fila por
 *   operación — `StockHistoryList`.
 * - **Recuentos** (solo con `stock.view_stockcount`): lista de recuentos —
 *   `StockCountsList`; con `stock.add_stockcount` el encabezado suma "Nuevo
 *   recuento".
 *
 * La vista vive en la URL (`?view=history|counts`; la de stock es la predeterminada y
 * no se escribe). Cambiar de vista descarta la búsqueda, los filtros, el orden
 * y la página de la anterior.
 */
export function InventoryPage() {
  useDocumentTitle("Inventario · Char");
  const can = useCan();
  const [params, setParams] = useSearchParams();
  const canViewHistory = can(PERMISSIONS.stock.movement.view);
  const canViewCounts = can(PERMISSIONS.stock.count.view);
  const requested = params.get("view");
  const view: InventoryView =
    requested === "history" && canViewHistory
      ? "history"
      : requested === "counts" && canViewCounts
        ? "counts"
        : "stock";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventario"
        description="Controlá el saldo de cada variante y revisá todo lo que entró y salió."
        actions={
          <div className="flex flex-wrap gap-3">
            {view === "counts" ? (
              <NewStockCountButton />
            ) : (
              <Can permission={PERMISSIONS.stock.movement.add}>
                <Button
                  render={<Link to="/admin/inventory/movements/new" />}
                  nativeButton={false}
                >
                  <Plus /> Nuevo movimiento
                </Button>
              </Can>
            )}
          </div>
        }
      />
      {canViewHistory || canViewCounts ? (
        <Tabs
          value={view}
          onValueChange={(next) =>
            setParams(next === "stock" ? {} : { view: next })
          }
        >
          <TabsList aria-label="Vista del inventario">
            <TabsTrigger value="stock">Stock</TabsTrigger>
            {canViewHistory ? (
              <TabsTrigger value="history">Historial</TabsTrigger>
            ) : null}
            {canViewCounts ? (
              <TabsTrigger value="counts">Recuentos</TabsTrigger>
            ) : null}
          </TabsList>
        </Tabs>
      ) : null}
      {view === "history" ? (
        <StockHistoryList />
      ) : view === "counts" ? (
        <StockCountsList />
      ) : (
        <StockList />
      )}
    </div>
  );
}
