import { useState } from "react";
import { AlertDialog } from "@/components/char/alert-dialog";
import { toApiError } from "@/lib/apiError";
import { useDeleteProduct } from "../hooks/useProducts";

/**
 * Confirmación "¿Eliminar «{nombre}»?" de un producto (`DELETE
 * /products/:id/`, borrado lógico). Si el backend lo rechaza (p. ej. 400 por
 * tener variantes activas, cuerpo en forma de lista) muestra su mensaje
 * **dentro del diálogo, sin cerrarlo**. Si sale bien llama a `onDeleted`
 * (la pantalla avisa y navega). Es controlado.
 *
 * @param open Si el diálogo está visible.
 * @param onOpenChange Se llama al cerrarlo por cualquier vía.
 * @param productId Id del producto.
 * @param productName Nombre, para el título.
 * @param onDeleted Se llama después de eliminar.
 */
export function ProductDeleteDialog({
  open,
  onOpenChange,
  productId,
  productName,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
  onDeleted: () => void;
}) {
  const { mutateAsync, isPending } = useDeleteProduct();
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null);
    onOpenChange(next);
  };

  const confirm = async () => {
    setError(null);
    try {
      await mutateAsync(productId);
      onOpenChange(false);
      onDeleted();
    } catch (caught) {
      setError(toApiError(caught).message);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={handleOpenChange}
      variant="danger"
      title={`¿Eliminar «${productName}»?`}
      description={
        error ? (
          <span role="alert" className="text-danger">
            {error}
          </span>
        ) : (
          "El producto deja de verse en la tienda y en el sistema."
        )
      }
      confirmLabel={isPending ? "Eliminando…" : "Eliminar"}
      confirmDisabled={isPending}
      closeOnConfirm={false}
      cancelLabel="Cancelar"
      onConfirm={() => void confirm()}
    />
  );
}
