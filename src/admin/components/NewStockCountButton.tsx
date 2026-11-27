import { Link } from "react-router";
import { Plus } from "lucide-react";
import { Can } from "@/auth/components/Can";
import { PERMISSIONS } from "@/auth/lib/permissions";
import { Button } from "@/components/char/button";

/**
 * Botón "Nuevo recuento" (solo con `stock.add_stockcount`): abre la pantalla de
 * recuento nuevo (`/admin/inventory/counts/new`). No llama al backend: el
 * recuento recién se crea al guardar el primer borrador.
 */
export function NewStockCountButton() {
  return (
    <Can permission={PERMISSIONS.stock.count.add}>
      <Button
        variant="info"
        render={<Link to="/admin/inventory/counts/new" />}
        nativeButton={false}
      >
        <Plus /> Nuevo recuento
      </Button>
    </Can>
  );
}
