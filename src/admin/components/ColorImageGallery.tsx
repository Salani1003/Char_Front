import { useRef, useState } from "react";
import { ImagePlus, Plus } from "lucide-react";
import { Button } from "@/components/char/button";
import { Label } from "@/components/char/label";
import { cn } from "@/lib/utils";
import type { UploadItem } from "../hooks/useImageUploadQueue";
import {
  canMoveImage,
  describeSection,
  IMAGE_ACCEPT_ATTR,
  reorderImages,
  type ColorSection,
  type ImageOrderPlan,
} from "../utils/productImages";
import { ImageTile } from "./ImageTile";
import { ImageUploadTile } from "./ImageUploadTile";
import { VariantColor } from "./VariantColor";

/**
 * Sección de la pestaña Imágenes para un color: muestra del tono, nombre,
 * resumen ("4 fotos · 1 principal · talles S y M"), acción "+ Subir fotos" y la
 * grilla (miniaturas ordenadas con la principal primero, archivos de la cola de
 * subida y, al final, el recuadro "Subir fotos / o arrastralas acá").
 *
 * - **Subir**: `<input type="file" multiple accept="image/jpeg,image/png,image/webp">`
 *   oculto, abierto desde "+ Subir fotos" y el recuadro (accesibles con
 *   teclado), y arrastrar archivos sobre la sección. Solo con `canAdd`.
 * - **Reordenar**: flechas en cada miniatura y arrastrar miniaturas (extra;
 *   la principal no se arrastra ni se le pasa por delante). Solo con `canChange`.
 * - El resumen incluye los archivos que se están subiendo.
 *
 * @param section Color con sus fotos ya ordenadas y sus talles.
 * @param uploads Archivos de la cola de este color.
 * @param canAdd Puede subir fotos (`add_productimage`).
 * @param canChange Puede marcar principal y reordenar (`change_productimage`).
 * @param onFiles Recibe los archivos elegidos o soltados.
 * @param onOpen Abre el detalle de una foto.
 * @param onSetPrimary Marca una foto como principal.
 * @param onReorder Aplica un reordenamiento (`reorderImages`).
 * @param onMove Mueve una foto una posición.
 * @param onCancelUpload Cancela una subida.
 * @param onRetryUpload Reintenta una subida con error.
 * @param onDiscardUpload Descarta una subida con error.
 */
export function ColorImageGallery({
  section,
  uploads,
  canAdd,
  canChange,
  onFiles,
  onOpen,
  onSetPrimary,
  onReorder,
  onMove,
  onCancelUpload,
  onRetryUpload,
  onDiscardUpload,
}: {
  section: ColorSection;
  uploads: UploadItem[];
  canAdd: boolean;
  canChange: boolean;
  onFiles: (files: File[]) => void;
  onOpen: (imageId: number) => void;
  onSetPrimary: (imageId: number) => void;
  onReorder: (plan: ImageOrderPlan) => void;
  onMove: (imageId: number, direction: -1 | 1) => void;
  onCancelUpload: (id: string) => void;
  onRetryUpload: (id: string) => void;
  onDiscardUpload: (id: string) => void;
}) {
  const { color, images } = section;
  const headingId = `image-color-${color.id}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileOver, setFileOver] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const uploading = uploads.filter((u) => u.status !== "error").length;
  const summary = [
    describeSection(section),
    uploading > 0
      ? `subiendo ${uploading} ${uploading === 1 ? "archivo" : "archivos"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const hasFiles = (event: React.DragEvent) =>
    event.dataTransfer.types.includes("Files");

  const dropOnImage = (targetIndex: number) => {
    if (draggingId === null) return;
    const from = images.findIndex((i) => i.id === draggingId);
    const plan = reorderImages(images, from, targetIndex);
    setDraggingId(null);
    if (plan) onReorder(plan);
  };

  return (
    <section
      aria-labelledby={headingId}
      onDragOver={(event) => {
        if (!canAdd || !hasFiles(event)) return;
        event.preventDefault();
        setFileOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setFileOver(false);
        }
      }}
      onDrop={(event) => {
        if (!canAdd || !hasFiles(event)) return;
        event.preventDefault();
        setFileOver(false);
        onFiles([...event.dataTransfer.files]);
      }}
      className={cn(
        "flex flex-col gap-4 rounded-card border border-border bg-card p-4 sm:p-6",
        fileOver && "border-primary bg-accent",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2
            id={headingId}
            tabIndex={-1}
            className="font-display text-xl font-medium outline-none"
          >
            {color.hex ? (
              <VariantColor name={color.name} hex={color.hex} />
            ) : (
              color.name
            )}
          </h2>
          <span className="text-sm text-muted-foreground">{summary}</span>
        </div>
        {canAdd ? (
          <Button
            type="button"
            variant="magenta"
            onClick={() => inputRef.current?.click()}
          >
            <Plus /> Subir fotos
          </Button>
        ) : null}
      </div>

      {canAdd ? (
        <>
          <Label htmlFor={`${headingId}-file`} className="sr-only">
            Subir fotos de {color.name}
          </Label>
          <input
            ref={inputRef}
            id={`${headingId}-file`}
            type="file"
            multiple
            accept={IMAGE_ACCEPT_ATTR}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              onFiles([...(event.target.files ?? [])]);
              event.target.value = "";
            }}
          />
        </>
      ) : null}

      <ul
        aria-label={`Fotos de ${color.name}`}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {images.map((image, index) => {
          const moves = canMoveImage(images, image.id);
          return (
            <ImageTile
              key={image.id}
              image={image}
              position={index + 1}
              total={images.length}
              colorName={color.name}
              canChange={canChange}
              canMoveLeft={moves.left}
              canMoveRight={moves.right}
              onOpen={() => onOpen(image.id)}
              onSetPrimary={() => onSetPrimary(image.id)}
              onMove={(direction) => onMove(image.id, direction)}
              dragging={draggingId === image.id}
              dragProps={
                canChange
                  ? {
                      draggable: !image.is_primary,
                      onDragStart: (event) => {
                        if (image.is_primary) return;
                        event.dataTransfer.effectAllowed = "move";
                        setDraggingId(image.id);
                      },
                      onDragOver: (event) => {
                        if (draggingId !== null && !hasFiles(event)) {
                          event.preventDefault();
                        }
                      },
                      onDrop: (event) => {
                        if (draggingId === null || hasFiles(event)) return;
                        event.preventDefault();
                        event.stopPropagation();
                        dropOnImage(index);
                      },
                      onDragEnd: () => setDraggingId(null),
                    }
                  : undefined
              }
            />
          );
        })}
        {uploads.map((item) => (
          <ImageUploadTile
            key={item.id}
            item={item}
            onCancel={() => onCancelUpload(item.id)}
            onRetry={() => onRetryUpload(item.id)}
            onDiscard={() => onDiscardUpload(item.id)}
          />
        ))}
        {canAdd ? (
          <li>
            <button
              type="button"
              aria-label={`Subir fotos de ${color.name}`}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square min-h-24 w-full flex-col items-center justify-center gap-1 rounded-card border border-dashed border-border p-3 text-center text-sm text-muted-foreground outline-none transition-colors hover:border-primary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ImagePlus className="size-6" aria-hidden />
              <span className="font-medium text-foreground">Subir fotos</span>
              <span className="text-xs">o arrastralas acá</span>
            </button>
          </li>
        ) : null}
      </ul>
      {images.length === 0 && uploads.length === 0 && !canAdd ? (
        <p className="text-sm text-muted-foreground">
          Este color todavía no tiene fotos.
        </p>
      ) : null}
    </section>
  );
}
