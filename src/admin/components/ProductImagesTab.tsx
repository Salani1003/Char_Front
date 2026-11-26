import { useEffect, useState } from "react";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { Button } from "@/components/char/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/char/card";
import { Label } from "@/components/char/label";
import { Notice } from "@/components/char/notice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { StateMessage } from "@/components/char/state-message";
import { toast } from "@/components/char/sonner";
import { toApiError } from "@/lib/apiError";
import { useImageUploadQueue } from "../hooks/useImageUploadQueue";
import { useAllColors } from "../hooks/useColors";
import {
  useReorderImages,
  useSetPrimaryImage,
} from "../hooks/useProductImages";
import type { Color } from "../interfaces/color.interface";
import type { ProductImageItem } from "../interfaces/product-image.interface";
import type {
  Product,
  ProductVariantItem,
} from "../interfaces/product.interface";
import {
  buildColorSections,
  moveImage,
  type ImageOrderPlan,
} from "../utils/productImages";
import { ColorImageGallery } from "./ColorImageGallery";
import { ProductImageDetailPanel } from "./ProductImageDetailPanel";

/**
 * Contenido de la pestaña "Imágenes" de la edición de un producto: una sección
 * por color (`ColorImageGallery`) y, al final, "Fotos de otro color".
 *
 * - **Secciones**: los colores de las variantes activas más los que ya tienen
 *   fotos aunque no tengan variantes (`buildColorSections`).
 * - **Subida**: cola con 2–3 `POST` en paralelo (`useImageUploadQueue`); los
 *   inválidos se rechazan antes de subir; un 503 corta la cola y muestra un
 *   único aviso.
 * - **Estrella y orden**: optimistas (`useSetPrimaryImage`, `useReorderImages`);
 *   la principal siempre va primera y solo se envían los `PATCH` de las fotos
 *   cuyo `sort_order` cambió.
 * - **Detalle**: al abrir una miniatura, `ProductImageDetailPanel`.
 * - **"Fotos de otro color"**: `select` con los colores que todavía no tienen
 *   sección y "Agregar", que solo crea una sección vacía **local** (sin
 *   request); la foto se registra al subir. Necesita `view_color` y `add_productimage`.
 * - Un *live region* anuncia progreso y resultados.
 * - **Permisos**: sin `add_productimage` no hay subida; sin `change_productimage`
 *   no hay estrella, flechas ni arrastre y el detalle es de solo lectura; sin
 *   `delete_productimage` no hay "Eliminar foto".
 *
 * @param product Producto.
 * @param variants Variantes activas (de ellas salen los colores y talles).
 * @param images Fotos activas (`images` de `with-variants`).
 * @param published Si el producto está publicado: no se puede eliminar ni mover de color la última foto que mantiene una variante con foto (se ofrece "Despublicar").
 * @param focusColorId Color al que llevar el foco/scroll (`?color=` de la URL).
 */
export function ProductImagesTab({
  product,
  variants,
  images,
  published,
  focusColorId,
}: {
  product: Product;
  variants: ProductVariantItem[];
  images: ProductImageItem[];
  /** Si el producto está publicado (rige la protección "no quedar sin variante con foto"). */
  published: boolean;
  focusColorId: number | null;
}) {
  const can = useCan();
  const canAdd = can(PERMISSIONS.products.productImage.add);
  const canChange = can(PERMISSIONS.products.productImage.change);
  const canDelete = can(PERMISSIONS.products.productImage.delete);
  const canViewColors = can(PERMISSIONS.products.color.view);
  const colors = useAllColors({ enabled: canViewColors });

  const [extraColors, setExtraColors] = useState<Color[]>([]);
  const [otherColorId, setOtherColorId] = useState<string | null>(null);
  const [openImageId, setOpenImageId] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const uploads = useImageUploadQueue({
    productId: product.id,
    announce: setAnnouncement,
  });
  const { mutate: setPrimary } = useSetPrimaryImage(product.id);
  const { mutate: reorder } = useReorderImages(product.id);

  const sections = buildColorSections({
    variants,
    images,
    extraColors,
    knownColors: colors.data,
  });
  const openImage = images.find((i) => i.id === openImageId) ?? null;

  useEffect(() => {
    if (focusColorId === null) return;
    const heading = document.getElementById(`image-color-${focusColorId}`);
    heading?.scrollIntoView({ block: "start" });
    heading?.focus();
  }, [focusColorId]);

  const handleSetPrimary = (imageId: number) =>
    setPrimary(imageId, {
      onSuccess: () => setAnnouncement("Foto marcada como principal"),
      onError: (error) =>
        toast.error(
          `No se pudo marcar como principal. ${toApiError(error).message}`,
        ),
    });

  const handleReorder = (plan: ImageOrderPlan, movedId?: number) =>
    reorder(plan.patches, {
      onSuccess: () => {
        const index = plan.ordered.findIndex((i) => i.id === movedId);
        if (index >= 0) {
          setAnnouncement(
            `Foto movida a la posición ${index + 1} de ${plan.ordered.length}`,
          );
        }
      },
      onError: () =>
        toast.error(
          "No se pudo guardar el orden de las fotos. Se volvió a cargar el estado real.",
        ),
    });

  const otherColors = (colors.data ?? []).filter(
    (color) => !sections.some((s) => s.color.id === color.id),
  );

  return (
    <div className="flex flex-col gap-6">
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {uploads.storageUnavailable ? (
        <Notice variant="danger">
          El almacenamiento de imágenes no está configurado. No se pudo subir
          ninguna foto: avisá a quien administra el sistema.
        </Notice>
      ) : null}

      {sections.length === 0 ? (
        <StateMessage variant="empty">
          Este producto todavía no tiene variantes ni fotos. Primero agregá
          variantes para poder cargar las fotos de cada color.
        </StateMessage>
      ) : (
        sections.map((section) => (
          <ColorImageGallery
            key={section.color.id}
            section={section}
            uploads={uploads.items.filter(
              (u) => u.colorId === section.color.id,
            )}
            canAdd={canAdd}
            canChange={canChange}
            onFiles={(files) =>
              uploads.enqueue(section.color.id, files, section.images)
            }
            onOpen={setOpenImageId}
            onSetPrimary={handleSetPrimary}
            onReorder={(plan) => handleReorder(plan)}
            onMove={(imageId, direction) => {
              const plan = moveImage(section.images, imageId, direction);
              if (plan) handleReorder(plan, imageId);
            }}
            onCancelUpload={uploads.cancel}
            onRetryUpload={uploads.retry}
            onDiscardUpload={uploads.discard}
          />
        ))
      )}

      {canAdd && canViewColors ? (
        <Card>
          <CardHeader>
            <CardTitle>Fotos de otro color</CardTitle>
            <CardDescription>
              Para cargar fotos de un color que todavía no tiene variantes en
              este producto.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-48 flex-1 flex-col gap-1.5">
              <Label htmlFor="other-color">Color</Label>
              <Select
                items={Object.fromEntries(
                  otherColors.map((c) => [String(c.id), c.name]),
                )}
                value={otherColorId}
                onValueChange={setOtherColorId}
                disabled={colors.isPending || otherColors.length === 0}
              >
                <SelectTrigger id="other-color" className="w-full">
                  <SelectValue
                    placeholder={
                      colors.isPending
                        ? "Cargando colores…"
                        : otherColors.length === 0
                          ? "No quedan colores"
                          : "Elegir un color"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {otherColors.map((color) => (
                    <SelectItem key={color.id} value={String(color.id)}>
                      {color.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={otherColorId === null}
              onClick={() => {
                const color = otherColors.find(
                  (c) => String(c.id) === otherColorId,
                );
                if (!color) return;
                setExtraColors((current) => [...current, color]);
                setOtherColorId(null);
                setAnnouncement(`Se agregó la sección de ${color.name}`);
              }}
            >
              Agregar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <ProductImageDetailPanel
        image={openImage}
        sections={sections}
        productName={product.name}
        productId={product.id}
        variants={variants}
        published={published}
        canChange={canChange}
        canDelete={canDelete}
        onClose={() => setOpenImageId(null)}
      />
    </div>
  );
}
