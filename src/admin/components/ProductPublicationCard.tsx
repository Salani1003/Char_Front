import { useState } from "react";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { Badge } from "@/components/char/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/char/card";
import { Label } from "@/components/char/label";
import { toast } from "@/components/char/sonner";
import { Switch } from "@/components/char/switch";
import { toApiError } from "@/lib/apiError";
import { useUpdateProduct } from "../hooks/useProducts";
import type { Product } from "../interfaces/product.interface";

/**
 * Tarjeta lateral "Publicación" de un producto guardado: estado (`Badge`),
 * interruptor "Mostrar en la tienda online" y la dirección en la tienda
 * (`/productos/{slug}`).
 *
 * - Cada accionar del interruptor envía `PATCH {is_published}` (con el
 *   interruptor deshabilitado mientras corre) y requiere
 *   `products.change_product`.
 * - **Despublicar** se puede siempre. **Publicar** exige al menos una variante
 *   con foto (`canPublish`): con `publishable={false}` el interruptor queda deshabilitado con
 *   la ayuda correspondiente; si el backend igual lo rechaza se muestra su
 *   mensaje (`is_published` del 400).
 * - El estado mostrado es siempre el del producto que devuelve la API.
 *
 * @param product Producto (la fuente de verdad del estado).
 * @param publishable Si cumple la regla de publicación (al menos una variante activa con foto; ver `canPublish`); `undefined` si no se sabe (sin permiso para ver variantes o fotos): se deja decidir al backend.
 */
export function ProductPublicationCard({
  product,
  publishable,
}: {
  product: Product;
  publishable: boolean | undefined;
}) {
  const can = useCan();
  const canChange = can(PERMISSIONS.products.product.change);
  const { mutateAsync, isPending } = useUpdateProduct();
  const [error, setError] = useState<string | null>(null);

  const published = product.is_published;
  const blockedByVariants = !published && publishable === false;
  const disabled = !canChange || isPending || blockedByVariants;

  const toggle = async (next: boolean) => {
    setError(null);
    try {
      await mutateAsync({ id: product.id, payload: { is_published: next } });
      toast.success(next ? "Producto publicado" : "Producto despublicado");
    } catch (caught) {
      const apiError = toApiError(caught);
      setError(apiError.fieldErrors.is_published ?? apiError.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicación</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <Badge variant={published ? "success" : "secondary"}>
            {published ? "Publicado" : "Sin publicar"}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="is_published">Mostrar en la tienda online</Label>
          <Switch
            id="is_published"
            checked={published}
            disabled={disabled}
            aria-describedby="is_published-hint"
            onCheckedChange={(checked) => void toggle(checked)}
          />
        </div>
        <p id="is_published-hint" className="text-sm text-muted-foreground">
          {blockedByVariants
            ? "Para publicar hace falta al menos una variante con foto. Si se apaga, el producto deja de verse en la tienda pero conserva sus datos."
            : "Si se apaga, el producto deja de verse en la tienda pero conserva sus datos."}
        </p>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <span className="text-sm font-medium">Dirección en la tienda</span>
          <code className="text-sm break-all text-muted-foreground">
            /productos/{product.slug}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
