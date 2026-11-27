import { useSearchParams } from "react-router";
import { PageHeader } from "@/components/char/page-header";
import { StateMessage } from "@/components/char/state-message";
import { Button } from "@/components/char/button";
import { Skeleton } from "@/components/char/skeleton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { StockMovementForm } from "@/admin/components/StockMovementForm";
import { useStockLevel } from "@/admin/hooks/useStockOperations";
import { stockErrorMessage } from "@/admin/utils/stock";

/**
 * Pantalla "Nuevo movimiento" (`/admin/inventory/movements/new`, permiso
 * `stock.add_stockmovement`): carga un ingreso o egreso con varias líneas
 * (`StockMovementForm`). Admite `?variant=<id>&kind=ingreso|egreso` para
 * llegar con esa variante precargada (los botones "+ Ingreso" / "− Egreso" de
 * la grilla de stock): se pide su saldo (`GET /stock/:id/`) y, mientras
 * llega, se muestra un esqueleto. Si la variante no se puede cargar se
 * muestra el error con "Reintentar".
 */
export function StockMovementNewPage() {
  useDocumentTitle("Nuevo movimiento · Char");
  const [params] = useSearchParams();
  const rawVariant = params.get("variant") ?? "";
  const variantId = /^\d+$/.test(rawVariant) ? Number(rawVariant) : null;
  const kind = params.get("kind") === "egreso" ? "egreso" : "ingreso";
  const level = useStockLevel(variantId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nuevo movimiento"
        description="Registrá el ingreso o egreso de stock de uno o varios productos."
      />
      {level.isPending && variantId !== null ? (
        <Skeleton
          role="status"
          aria-label="Cargando variante"
          className="h-64 w-full"
        />
      ) : level.isError ? (
        <StateMessage
          variant="error"
          action={
            <Button variant="secondary" onClick={() => void level.refetch()}>
              Reintentar
            </Button>
          }
        >
          {stockErrorMessage(level.error, "No encontramos esa variante.")}
        </StateMessage>
      ) : (
        <StockMovementForm
          initialKind={kind}
          initialLevel={level.data ?? null}
        />
      )}
    </div>
  );
}
