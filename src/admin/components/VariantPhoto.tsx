import { Link } from "react-router";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/char/button";
import type { ProductVariant } from "../interfaces/product-variant.interface";

/**
 * Miniatura de la foto de una variante en el listado: la principal de su color
 * (`thumbnail_url`, o `image_url` si falta). Sin foto muestra el botón "Sin foto"
 * (`aria-label="Agregar fotos de Rojo"`) que lleva a la pestaña Imágenes del
 * producto en ese color (`?tab=images&color=<id>`).
 *
 * @param variant Variante de la grilla (trae `thumbnail_url` / `image_url`).
 */
export function VariantPhoto({ variant }: { variant: ProductVariant }) {
  const src = variant.thumbnail_url ?? variant.image_url;
  return src ? (
    <img
      src={src}
      alt={`Foto de ${variant.product_name}, ${variant.color_name}`}
      loading="lazy"
      className="size-12 rounded-md object-cover"
    />
  ) : (
    <Button
      variant="secondary"
      size="sm"
      render={
        <Link
          to={`/admin/products/${variant.product}?tab=images&color=${variant.color}`}
        />
      }
      nativeButton={false}
      aria-label={`Agregar fotos de ${variant.color_name}`}
    >
      <ImagePlus /> Sin foto
    </Button>
  );
}
