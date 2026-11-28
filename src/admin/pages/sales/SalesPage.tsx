import { Link, useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import { Can } from "@/auth/components/Can";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { Button } from "@/components/char/button";
import { PageHeader } from "@/components/char/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/char/tabs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { NEW_SALE_PATH } from "@/admin/utils/sales";
import { ExchangesList } from "./ExchangesList";
import { SalesList } from "./SalesList";

type SalesView = "sales" | "exchanges";

/**
 * Pantalla de Ventas (`/admin/sales`, permiso `sales.view_sale`): encabezado
 * con "Nueva venta" (`sales.add_sale`) y un selector de vista,
 * `components/char/tabs`:
 *
 * - **Ventas** (por defecto): `SalesList`.
 * - **Cambios** (solo con `sales.view_exchange`): `ExchangesList`.
 *
 * La vista vive en la URL (`?view=exchanges`; la de ventas es la
 * predeterminada y no se escribe). Cambiar de vista descarta la búsqueda, los
 * filtros, el orden y la página de la anterior.
 */
export function SalesPage() {
  useDocumentTitle("Ventas · Char");
  const can = useCan();
  const [params, setParams] = useSearchParams();
  const canViewExchanges = can(PERMISSIONS.sales.exchange.view);
  const view: SalesView =
    params.get("view") === "exchanges" && canViewExchanges
      ? "exchanges"
      : "sales";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ventas"
        description="Registrá ventas y cambios y consultá su historial."
        actions={
          <Can permission={PERMISSIONS.sales.add}>
            <Button
              variant="info"
              render={<Link to={NEW_SALE_PATH} />}
              nativeButton={false}
            >
              <Plus /> Nueva venta
            </Button>
          </Can>
        }
      />
      {canViewExchanges ? (
        <Tabs
          value={view}
          onValueChange={(next) =>
            setParams(next === "sales" ? {} : { view: next })
          }
        >
          <TabsList aria-label="Vista de ventas">
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="exchanges">Cambios</TabsTrigger>
          </TabsList>
        </Tabs>
      ) : null}
      {view === "exchanges" ? <ExchangesList /> : <SalesList />}
    </div>
  );
}
