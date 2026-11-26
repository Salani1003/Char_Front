import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Button } from "@/components/char/button";
import { Dialog } from "@/components/char/dialog";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { Notice } from "@/components/char/notice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { toast } from "@/components/char/sonner";
import { Switch } from "@/components/char/switch";
import { toApiError } from "@/lib/apiError";
import { useUpdateProduct } from "../hooks/useProducts";
import type { ProductVariantItem } from "../interfaces/product.interface";
import {
  useDeleteProductImage,
  useSaveProductImage,
} from "../hooks/useProductImages";
import type { ProductImageItem } from "../interfaces/product-image.interface";
import {
  getHttpStatus,
  hasImageChanges,
  wouldBreakPublication,
  planImageUpdate,
  sortGalleryImages,
  type ColorSection,
  type ImageDraft,
} from "../utils/productImages";

/** Vistas del panel: siempre un solo nivel, la confirmación reemplaza el contenido. */
export type ImageDetailView =
  "edit" | "discard" | "confirm-delete" | "delete-error";

interface PanelProps {
  /** Foto abierta; `null` = panel cerrado. */
  image: ProductImageItem | null;
  /** Todas las secciones de colores (para el selector de color y las galerías). */
  sections: ColorSection[];
  productName: string;
  productId: number;
  /** Variantes activas (para anticipar la regla de publicación). */
  variants: ProductVariantItem[];
  /** Si el producto está publicado. */
  published: boolean;
  /** Puede editar (`change_productimage`); sin esto el panel es de solo lectura. */
  canChange: boolean;
  /** Puede eliminar (`delete_productimage`). */
  canDelete: boolean;
  onClose: () => void;
  /** Vista con la que abre (para stories). */
  initialView?: ImageDetailView;
  /** Mensaje de error con el que abre la vista `delete-error` (para stories). */
  initialError?: string;
}

/**
 * Panel de detalle de una foto (se abre al hacer clic en una miniatura). El
 * sistema de diseño no tiene un panel lateral, así que usa el `Dialog` de
 * Char. **Un solo nivel de modales**: la confirmación de eliminar y el
 * descarte de cambios reemplazan el contenido del mismo panel.
 *
 * - **Editar (estado A)**: vista previa, texto alternativo, color (cambiarlo
 *   pasa la foto al final de la galería del nuevo color y sin ser principal),
 *   posición con flechas, interruptor "Foto principal de {color}" (deshabilitado
 *   si ya lo es) y **Eliminar foto / Cancelar / Guardar**. Guardar envía un
 *   `PATCH` con lo que cambió (`planImageUpdate`); si se movió de posición, además
 *   renumera el `sort_order` de las demás fotos afectadas. Con cambios sin
 *   guardar, cerrar pide confirmar el descarte dentro del panel.
 * - **Confirmar (B)**: "¿Eliminar la foto 2 de Azul?" con la advertencia de que
 *   no se puede deshacer.
 * - **Falla (C)**: 502 → "La foto no se eliminó: probá de nuevo" con Cerrar /
 *   Reintentar; 503 → aviso de almacenamiento sin configurar.
 * - Éxito al eliminar o guardar: cierra el panel, refresca y avisa con un toast.
 *
 * @param image Foto abierta o `null`.
 * @param sections Secciones de colores del producto.
 * @param productName Nombre del producto (subtítulo).
 * @param productId Producto (para refrescar sus datos).
 * @param variants Variantes activas del producto.
 * @param published Si el producto está publicado. Entonces no se puede eliminar la última foto que mantiene una variante con foto, ni pasarla a un color sin variantes (`wouldBreakPublication`): la acción queda deshabilitada con la ayuda "despublicá el producto primero" y el atajo **Despublicar producto**; un `400` del backend se muestra igual con el mismo atajo.
 * @param canChange Si puede editar.
 * @param canDelete Si puede eliminar.
 * @param onClose Cierra el panel.
 * @param initialView Vista inicial (solo para stories).
 * @param initialError Mensaje inicial de la vista de error (solo para stories).
 */
export function ProductImageDetailPanel(props: PanelProps) {
  const { image } = props;
  if (!image) return null;
  return <DetailContent key={image.id} {...props} image={image} />;
}

function DetailContent({
  image,
  sections,
  productName,
  productId,
  variants,
  published,
  canChange,
  canDelete,
  onClose,
  initialView = "edit",
  initialError = null,
}: Omit<PanelProps, "image" | "initialError"> & {
  image: ProductImageItem;
  initialError?: string | null;
}) {
  const save = useSaveProductImage(productId);
  const remove = useDeleteProductImage(productId);
  const { mutateAsync: updateProduct, isPending: unpublishing } =
    useUpdateProduct();

  const ownSection = sections.find((s) => s.color.id === image.color);
  const colorImages = ownSection?.images ?? [image];
  const position = sortGalleryImages(colorImages).findIndex(
    (i) => i.id === image.id,
  );
  const [draft, setDraft] = useState<ImageDraft>({
    alt_text: image.alt_text,
    color: image.color,
    is_primary: image.is_primary,
    position,
  });
  const [view, setView] = useState<ImageDetailView>(initialView);
  const [error, setError] = useState<string | null>(initialError);
  // Con 503 (almacenamiento sin configurar) reintentar no sirve.
  const [retryable, setRetryable] = useState(true);

  const colorChanged = draft.color !== image.color;
  const destination =
    sections.find((s) => s.color.id === draft.color)?.images ?? [];
  const plan = planImageUpdate(image, colorImages, destination, draft);
  const dirty = hasImageChanges(plan);
  const busy = save.isPending || remove.isPending || unpublishing;

  const allImages = sections.flatMap((s) => s.images);
  const deleteBlocked =
    published &&
    wouldBreakPublication(variants, allImages, { withoutImageId: image.id });
  const colorBlocked =
    published &&
    colorChanged &&
    wouldBreakPublication(variants, allImages, {
      imageToColor: { id: image.id, color: draft.color },
    });
  const [errorStatus, setErrorStatus] = useState<number | undefined>();

  const unpublish = async () => {
    try {
      await updateProduct({ id: productId, payload: { is_published: false } });
      toast.success("Producto despublicado");
      setError(null);
      if (view === "delete-error") setView("confirm-delete");
    } catch (caught) {
      setError(toApiError(caught).message);
    }
  };
  const unpublishButton = published ? (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={busy}
      onClick={() => void unpublish()}
    >
      {unpublishing ? "Despublicando…" : "Despublicar producto"}
    </Button>
  ) : null;

  const colorName = ownSection?.color.name ?? "este color";
  const draftColorName =
    sections.find((s) => s.color.id === draft.color)?.color.name ?? colorName;
  const sorted = sortGalleryImages(colorImages);
  const currentPrimary = sorted.find((i) => i.is_primary);
  const firstMovable = sorted[0]?.is_primary ? 1 : 0;
  const positionLocked =
    !canChange || image.is_primary || colorChanged || draft.is_primary;

  const requestClose = () => {
    if (busy) return;
    if (view === "edit" && dirty) setView("discard");
    else if (view === "discard" || view === "confirm-delete") setView("edit");
    else onClose();
  };

  const submit = async () => {
    setError(null);
    try {
      await save.mutateAsync({ id: image.id, ...plan });
      toast.success("Foto actualizada");
      onClose();
    } catch (caught) {
      const apiError = toApiError(caught);
      setErrorStatus(getHttpStatus(caught));
      setError(Object.values(apiError.fieldErrors)[0] ?? apiError.message);
    }
  };

  const confirmDelete = async () => {
    setError(null);
    try {
      await remove.mutateAsync(image.id);
      toast.success("Foto eliminada");
      onClose();
    } catch (caught) {
      const status = getHttpStatus(caught);
      setErrorStatus(status);
      setRetryable(status !== 503);
      setError(
        status === 502
          ? "No se pudo eliminar del servidor de imágenes (502). La foto no se eliminó: probá de nuevo en unos minutos."
          : status === 503
            ? "El almacenamiento de imágenes no está configurado. La foto no se eliminó."
            : toApiError(caught).message,
      );
      setView("delete-error");
    }
  };

  const preview = image.url ? (
    <img
      src={image.url}
      alt="Vista previa de la foto"
      className="max-h-64 max-w-full self-center rounded-lg object-contain"
    />
  ) : (
    <div
      role="img"
      aria-label="Vista previa de la foto"
      className="flex h-40 w-40 flex-col items-center justify-center gap-1 self-center rounded-lg bg-muted text-xs text-muted-foreground"
    >
      <ImageOff className="size-5" aria-hidden />
      Sin imagen
    </div>
  );

  const title =
    view === "edit"
      ? `Foto ${position + 1} de ${colorImages.length} · ${colorName}`
      : view === "discard"
        ? "¿Descartar los cambios?"
        : `¿Eliminar la foto ${position + 1} de ${colorName}?`;

  const description =
    view === "edit"
      ? productName
      : view === "confirm-delete"
        ? "Se borra de la tienda y también del servidor de imágenes. No se puede deshacer. Las demás fotos de este color no cambian."
        : view === "discard"
          ? "Si cerrás ahora se pierden los cambios que hiciste en esta foto."
          : undefined;

  const colorOptions = Object.fromEntries(
    sections.map((s) => [String(s.color.id), s.color.name]),
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
      title={title}
      description={description}
    >
      {view === "edit" ? (
        <div className="flex flex-col gap-5">
          {preview}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="image-alt">Texto alternativo</Label>
            <Input
              id="image-alt"
              value={draft.alt_text}
              disabled={!canChange}
              aria-describedby="image-alt-help"
              onChange={(event) =>
                setDraft({ ...draft, alt_text: event.target.value })
              }
            />
            <span id="image-alt-help" className="text-xs text-muted-foreground">
              Describe la foto para accesibilidad y buscadores. Es opcional.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="image-color">Color</Label>
            <Select
              items={colorOptions}
              value={String(draft.color)}
              disabled={!canChange}
              onValueChange={(next) => {
                if (next === null) return;
                setDraft({
                  ...draft,
                  color: Number(next),
                  is_primary: false,
                  position,
                });
              }}
            >
              <SelectTrigger
                id="image-color"
                className="w-full"
                aria-describedby="image-color-help"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.color.id} value={String(s.color.id)}>
                    {s.color.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span
              id="image-color-help"
              className="text-xs text-muted-foreground"
            >
              {colorChanged
                ? `La foto pasará al final de la galería de ${draftColorName}, sin ser la principal.`
                : "Si se cargó en el color equivocado, cambialo acá: la foto pasa al final de la galería de ese color."}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                Posición en la galería
              </span>
              <span
                className="text-xs text-muted-foreground"
                aria-live="polite"
              >
                {colorChanged
                  ? `Al final de ${draftColorName}`
                  : `${(draft.is_primary && !image.is_primary ? 0 : draft.position) + 1} de ${colorImages.length}`}
                {image.is_primary ? " · La principal siempre va primera" : ""}
              </span>
            </div>
            <span className="flex gap-1">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Mover a la izquierda"
                disabled={positionLocked || draft.position <= firstMovable}
                onClick={() =>
                  setDraft({ ...draft, position: draft.position - 1 })
                }
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Mover a la derecha"
                disabled={
                  positionLocked || draft.position >= colorImages.length - 1
                }
                onClick={() =>
                  setDraft({ ...draft, position: draft.position + 1 })
                }
              >
                <ChevronRight />
              </Button>
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="image-primary">
                Foto principal de {draftColorName}
              </Label>
              <span
                id="image-primary-help"
                className="text-xs text-muted-foreground"
              >
                {image.is_primary
                  ? "Para cambiar la principal, marcá otra foto."
                  : colorChanged
                    ? "Al cambiar de color, la foto no queda como principal."
                    : currentPrimary
                      ? `Hoy la principal es la foto 1${currentPrimary.alt_text.trim() ? ` (${currentPrimary.alt_text.trim()})` : ""}. Al marcar esta, deja de serlo.`
                      : "Este color todavía no tiene foto principal."}
              </span>
            </div>
            <Switch
              id="image-primary"
              checked={draft.is_primary}
              disabled={!canChange || image.is_primary || colorChanged}
              aria-describedby="image-primary-help"
              onCheckedChange={(checked) =>
                setDraft({ ...draft, is_primary: checked, position })
              }
            />
          </div>

          {colorBlocked ? (
            <Notice variant="warning">
              <span className="flex flex-wrap items-center gap-3">
                <span>
                  Es la última foto con variante de un producto publicado: no se
                  puede pasar a un color sin variantes. Para hacerlo, despublicá
                  el producto primero.
                </span>
                {unpublishButton}
              </span>
            </Notice>
          ) : null}
          {error ? (
            <Notice variant="danger">
              <span className="flex flex-wrap items-center gap-3">
                <span>{error}</span>
                {errorStatus === 400 ? unpublishButton : null}
              </span>
            </Notice>
          ) : null}
          {deleteBlocked ? (
            <p id="image-delete-help" className="text-xs text-muted-foreground">
              No se puede eliminar: es la última foto que mantiene una variante
              con foto de un producto publicado. Para eliminarla, despublicá el
              producto primero.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {canDelete ? (
              <Button
                type="button"
                variant="danger"
                disabled={busy || deleteBlocked}
                aria-describedby={
                  deleteBlocked ? "image-delete-help" : undefined
                }
                onClick={() => {
                  setError(null);
                  setView("confirm-delete");
                }}
              >
                Eliminar foto
              </Button>
            ) : (
              <span />
            )}
            <span className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={requestClose}
              >
                {canChange ? "Cancelar" : "Cerrar"}
              </Button>
              {canChange ? (
                <Button
                  type="button"
                  disabled={busy || !dirty || colorBlocked}
                  onClick={() => void submit()}
                >
                  {save.isPending ? "Guardando…" : "Guardar"}
                </Button>
              ) : null}
            </span>
          </div>
        </div>
      ) : null}

      {view === "discard" ? (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setView("edit")}
          >
            Seguir editando
          </Button>
          <Button type="button" variant="danger" onClick={onClose}>
            Descartar
          </Button>
        </div>
      ) : null}

      {view === "confirm-delete" || view === "delete-error" ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-card border border-border p-3">
            {(image.thumbnail_url ?? image.url) ? (
              <img
                src={(image.thumbnail_url ?? image.url) as string}
                alt=""
                className="size-14 shrink-0 rounded-md object-cover"
              />
            ) : (
              <ImageOff className="size-6 text-muted-foreground" aria-hidden />
            )}
            <span className="flex min-w-0 flex-col">
              <span className="font-medium">
                Foto {position + 1} · {colorName}
              </span>
              {image.alt_text.trim() ? (
                <span className="text-xs text-muted-foreground">
                  {image.alt_text.trim()}
                </span>
              ) : null}
            </span>
          </div>
          {view === "delete-error" && error ? (
            <Notice variant="danger">
              <span className="flex flex-wrap items-center gap-3">
                <span>{error}</span>
                {errorStatus === 400 ? unpublishButton : null}
              </span>
            </Notice>
          ) : null}
          <div className="flex justify-end gap-2">
            {view === "confirm-delete" ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={remove.isPending}
                  onClick={() => setView("edit")}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={remove.isPending}
                  onClick={() => void confirmDelete()}
                >
                  {remove.isPending ? "Eliminando…" : "Eliminar"}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cerrar
                </Button>
                {retryable ? (
                  <Button
                    type="button"
                    variant="danger"
                    disabled={remove.isPending}
                    onClick={() => void confirmDelete()}
                  >
                    {remove.isPending ? "Eliminando…" : "Reintentar"}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
