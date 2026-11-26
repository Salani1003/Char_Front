import { ImagePlus } from "lucide-react";
import { Button } from "@/components/char/button";
import type { ProductImageItem } from "../interfaces/product-image.interface";

/**
 * Celda de la columna **Foto** de la tabla de variantes: la miniatura de la
 * foto efectiva del color (la primera de sus fotos, con la principal primero) o,
 * si el color no tiene, el recuadro "Sin foto": un botón
 * (`aria-label="Agregar fotos de Rojo"`) que lleva a la pestaña Imágenes en ese
 * color.
 *
 * @param image Foto efectiva del color; `null` si no tiene.
 * @param colorName Nombre del color (etiquetas accesibles).
 * @param onAddPhotos Navega a `?tab=images&color=<id>`.
 */
export function ColorPhotoThumb({
  image,
  colorName,
  onAddPhotos,
}: {
  image: ProductImageItem | null;
  colorName: string;
  onAddPhotos: () => void;
}) {
  const src = image ? (image.thumbnail_url ?? image.url) : null;
  if (src) {
    return (
      <img
        src={src}
        alt={image?.alt_text.trim() || `Foto de ${colorName}`}
        loading="lazy"
        className="size-12 rounded-md object-cover"
      />
    );
  }
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label={`Agregar fotos de ${colorName}`}
      onClick={onAddPhotos}
    >
      <ImagePlus /> Sin foto
    </Button>
  );
}
