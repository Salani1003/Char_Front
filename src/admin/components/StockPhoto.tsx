import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockLevel } from "../interfaces/stock.interface";

/**
 * Miniatura de la foto principal de una variante en las pantallas de stock
 * (`thumbnail_url`, o `image_url` si falta). Sin foto muestra un recuadro con
 * un ícono, para que las filas conserven el mismo alto y alineación.
 *
 * @param level Saldo de la variante (trae `thumbnail_url` / `image_url`).
 * @param className Clases del recuadro (ej. el tamaño; por defecto `size-12`).
 */
export function StockPhoto({
  level,
  className,
}: {
  level: Pick<
    StockLevel,
    "thumbnail_url" | "image_url" | "product_name" | "color_name"
  >;
  className?: string;
}) {
  const src = level.thumbnail_url ?? level.image_url;
  return src ? (
    <img
      src={src}
      alt={`Foto de ${level.product_name}, ${level.color_name}`}
      loading="lazy"
      className={cn("size-12 shrink-0 rounded-md object-cover", className)}
    />
  ) : (
    <span
      role="img"
      aria-label="Sin foto"
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground",
        className,
      )}
    >
      <ImageOff className="size-4" aria-hidden />
    </span>
  );
}
