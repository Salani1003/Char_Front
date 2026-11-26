import type { ComponentProps } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Star } from "lucide-react";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import { cn } from "@/lib/utils";
import type { ProductImageItem } from "../interfaces/product-image.interface";

/**
 * Miniatura de una foto en la galería de un color: la imagen (`thumbnail_url`,
 * botón que abre el detalle), el badge "Principal" si lo es, la estrella para
 * marcarla como principal (`aria-pressed`), su posición ("2 de 4") y las
 * flechas "Mover a la izquierda/derecha".
 *
 * - **Principal**: sus flechas quedan deshabilitadas (siempre va primera) y la
 *   ayuda "La principal siempre va primera" las describe.
 * - Sin `canChange` no hay estrella, flechas ni arrastre (solo se puede abrir
 *   el detalle, que queda de solo lectura).
 * - Arrastrar y soltar es un extra: pasa los manejadores en `dragProps`; todo
 *   se puede hacer con las flechas.
 *
 * @param image Foto (con `thumbnail_url`, `alt_text`, `is_primary`).
 * @param position Posición en la galería, empezando en 1.
 * @param total Cantidad de fotos del color.
 * @param colorName Nombre del color (para las etiquetas accesibles).
 * @param canChange Si el usuario puede marcar principal y reordenar (`change_productimage`).
 * @param canMoveLeft Si la flecha izquierda está disponible.
 * @param canMoveRight Si la flecha derecha está disponible.
 * @param onOpen Abre el detalle de la foto.
 * @param onSetPrimary Marca la foto como principal.
 * @param onMove Mueve la foto una posición (`-1` izquierda, `1` derecha).
 * @param dragProps Atributos de arrastrar y soltar para el `<li>`.
 * @param dragging Si es la foto que se está arrastrando.
 */
export function ImageTile({
  image,
  position,
  total,
  colorName,
  canChange,
  canMoveLeft,
  canMoveRight,
  onOpen,
  onSetPrimary,
  onMove,
  dragProps,
  dragging,
}: {
  image: ProductImageItem;
  position: number;
  total: number;
  colorName: string;
  canChange: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onOpen: () => void;
  onSetPrimary: () => void;
  onMove: (direction: -1 | 1) => void;
  dragProps?: ComponentProps<"li">;
  dragging?: boolean;
}) {
  const src = image.thumbnail_url ?? image.url;
  const alt = image.alt_text.trim();
  const helpId = `image-${image.id}-help`;
  return (
    <li
      {...dragProps}
      className={cn(
        "flex flex-col gap-2 rounded-card border border-border bg-card p-2",
        dragging && "opacity-50",
      )}
    >
      <div className="relative">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${canChange ? "Editar" : "Ver"} foto ${position} de ${colorName}${alt ? `: ${alt}` : ""}`}
          className="block aspect-square w-full overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {src ? (
            <img
              src={src}
              alt=""
              loading="lazy"
              draggable={false}
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
              <ImageOff className="size-5" aria-hidden />
              Sin imagen
            </span>
          )}
        </button>
        {image.is_primary ? (
          <Badge
            variant="primary"
            className="pointer-events-none absolute top-2 left-2"
          >
            Principal
          </Badge>
        ) : null}
        {canChange ? (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-1 right-1"
            aria-pressed={image.is_primary}
            aria-label={
              image.is_primary
                ? `Es la foto principal de ${colorName}`
                : `Marcar como foto principal de ${colorName}`
            }
            disabled={image.is_primary}
            onClick={onSetPrimary}
          >
            <Star className={cn(image.is_primary && "fill-current")} />
          </Button>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs text-muted-foreground">
          {position} de {total}
        </span>
        {canChange ? (
          <span
            className="flex gap-1"
            aria-describedby={image.is_primary ? helpId : undefined}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mover a la izquierda"
              disabled={!canMoveLeft}
              onClick={() => onMove(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mover a la derecha"
              disabled={!canMoveRight}
              onClick={() => onMove(1)}
            >
              <ChevronRight />
            </Button>
          </span>
        ) : null}
      </div>
      {image.is_primary && canChange ? (
        <span id={helpId} className="text-xs text-muted-foreground">
          La principal siempre va primera.
        </span>
      ) : null}
    </li>
  );
}
