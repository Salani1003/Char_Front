import { useState } from "react";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Button } from "@/components/char/button";
import { toast } from "@/components/char/sonner";
import { toApiError } from "@/lib/apiError";
import { useUpdateProduct } from "../hooks/useProducts";
import { useDeleteProductVariant } from "../hooks/useProductVariantMutations";
import type { ProductVariantItem } from "../interfaces/product.interface";

/**
 * Confirmación "¿Eliminar la variante CHAR-0002 (Azul / M)?" (`DELETE
 * /product-variants/:id/`, borrado lógico). Se abre desde la tabla, nunca
 * desde el panel de alta. Si el backend lo rechaza (400 por ser la **última**
 * variante de un producto publicado, cuerpo en forma de lista) muestra su
 * mensaje dentro del diálogo, sin cerrarlo, con el acceso directo
 * "Despublicar producto": al despublicar se limpia el error y se puede
 * reintentar "Eliminar". Éxito: cierra y avisa con un toast.
 *
 * @param blockedByPhotos Si el producto está publicado y esta es la última variante con foto: el backend lo rechazaría, así que "Eliminar" queda deshabilitado con la ayuda "Para eliminarla, despublicá el producto primero" y el atajo "Despublicar producto".
 * @param variant Variante a eliminar; `null` mantiene el diálogo cerrado.
 * @param productId Producto de la variante.
 * @param productPublished Si el producto está publicado (habilita el atajo de despublicar).
 * @param onClose Cierra el diálogo.
 */
export function ProductVariantDeleteDialog({
  variant,
  blockedByPhotos = false,
  productId,
  productPublished,
  onClose,
}: {
  variant: ProductVariantItem | null;
  blockedByPhotos?: boolean;
  productId: number;
  productPublished: boolean;
  onClose: () => void;
}) {
  const { mutateAsync: deleteVariant, isPending } = useDeleteProductVariant();
  const { mutateAsync: updateProduct, isPending: unpublishing } =
    useUpdateProduct();
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setError(null);
    onClose();
  };

  const confirm = async () => {
    if (!variant) return;
    setError(null);
    try {
      await deleteVariant({ id: variant.id, productId });
      toast.success(`Variante ${variant.sku} eliminada`);
      close();
    } catch (caught) {
      setError(toApiError(caught).message);
    }
  };

  const unpublish = async () => {
    try {
      await updateProduct({ id: productId, payload: { is_published: false } });
      toast.success("Producto despublicado");
      setError(null);
    } catch (caught) {
      setError(toApiError(caught).message);
    }
  };

  return (
    <AlertDialog
      open={variant !== null}
      onOpenChange={(open) => !open && close()}
      variant="danger"
      title={
        variant
          ? `¿Eliminar la variante ${variant.sku} (${variant.color.name} / ${variant.size.name})?`
          : "¿Eliminar la variante?"
      }
      description={
        error || blockedByPhotos ? (
          <span className="flex flex-col items-center gap-3">
            <span role="alert" className="text-danger">
              {error ??
                "Es la última variante con foto de un producto publicado. Para eliminarla, despublicá el producto primero."}
            </span>
            {productPublished ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={unpublishing}
                onClick={() => void unpublish()}
              >
                {unpublishing ? "Despublicando…" : "Despublicar producto"}
              </Button>
            ) : null}
          </span>
        ) : (
          "La variante deja de estar disponible. Esta acción no se puede deshacer desde acá."
        )
      }
      confirmLabel={isPending ? "Eliminando…" : "Eliminar"}
      confirmDisabled={isPending || unpublishing || blockedByPhotos}
      closeOnConfirm={false}
      cancelLabel="Cancelar"
      onConfirm={() => void confirm()}
    />
  );
}
