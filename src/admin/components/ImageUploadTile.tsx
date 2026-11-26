import { CircleAlert, ImageOff, X } from "lucide-react";
import { Button } from "@/components/char/button";
import { cn } from "@/lib/utils";
import type { UploadItem } from "../hooks/useImageUploadQueue";

/**
 * Elemento de la grilla para un archivo de la cola de subida (se muestra junto
 * a las miniaturas de su color). Estados:
 * - **en cola / subiendo**: barra de progreso (`role="progressbar"` con
 *   `aria-valuenow`) y "Cancelar" (aborta la subida);
 * - **error**: el mensaje de la causa (`role="alert"`), "Reintentar" y
 *   "Descartar" (con `aria-label`);
 * - **listo**: la miniatura devuelta por la API y "Lista" hasta que la galería
 *   se refresca y la reemplaza.
 *
 * @param item Archivo de la cola.
 * @param onCancel Cancela una subida en curso o en cola.
 * @param onRetry Reintenta un archivo con error.
 * @param onDiscard Quita un archivo con error.
 */
export function ImageUploadTile({
  item,
  onCancel,
  onRetry,
  onDiscard,
}: {
  item: UploadItem;
  onCancel: () => void;
  onRetry: () => void;
  onDiscard: () => void;
}) {
  const name = item.file.name;
  return (
    <li className="flex flex-col gap-2 rounded-card border border-border bg-card p-2">
      <div
        className={cn(
          "flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg bg-muted p-3 text-center",
        )}
      >
        {item.status === "error" ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-1 text-sm text-danger"
          >
            <CircleAlert className="size-5" aria-hidden />
            <span className="font-medium">No se pudo subir</span>
            <span className="text-xs">{item.error}</span>
          </div>
        ) : item.status === "done" ? (
          item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt=""
              className="size-full rounded-lg object-cover"
            />
          ) : (
            <ImageOff className="size-5 text-muted-foreground" aria-hidden />
          )
        ) : (
          <>
            <span className="text-sm text-muted-foreground">
              {item.status === "queued"
                ? "En cola…"
                : `Subiendo… ${item.progress} %`}
            </span>
            <div
              role="progressbar"
              aria-label={`Subiendo ${name}`}
              aria-valuenow={item.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full overflow-hidden rounded-full bg-border"
            >
              <div
                className="h-full bg-primary transition-[width]"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex items-center justify-between gap-1">
        <span
          className="min-w-0 truncate text-xs text-muted-foreground"
          title={name}
        >
          {item.status === "done" ? `Lista · ${name}` : name}
        </span>
        {item.status === "error" ? (
          <span className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onRetry}
            >
              Reintentar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Descartar ${name}`}
              onClick={onDiscard}
            >
              <X />
            </Button>
          </span>
        ) : item.status === "done" ? null : (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </li>
  );
}
