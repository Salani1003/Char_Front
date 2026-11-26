import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { PageHeader } from "@/components/char/page-header";
import { StateMessage } from "@/components/char/state-message";

/**
 * Pantalla de clientes (`/admin/clients`). Todavía no tiene listado: muestra
 * el encabezado de página y un estado vacío que avisa que la sección está en
 * construcción. Cuando exista, seguir el patrón de `UsersPage`.
 */
export const ClientsPage = () => {
  useDocumentTitle("Clientes · Char");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description="Consultá y administrá la cartera de clientes."
      />
      <StateMessage variant="empty">
        Esta sección todavía no está disponible. Vas a poder gestionar tus
        clientes desde acá.
      </StateMessage>
    </div>
  );
};
