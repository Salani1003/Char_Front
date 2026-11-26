import axios from "axios";
import { toApiError } from "@/lib/apiError";
import type { Color } from "../interfaces/color.interface";
import type { ProductImageItem } from "../interfaces/product-image.interface";
import type { UpdateProductImageRequest } from "../interfaces/product-image.request";
import type { ProductVariantItem } from "../interfaces/product.interface";
import type { Size } from "../interfaces/size.interface";

/*
 * Lógica pura de las fotos de producto (pestaña Imágenes). No hay runner de
 * tests: cada función es chica, sin efectos y documentada con sus casos.
 */

// ─── Validación de archivos ────────────────────────────────────────────────

/** Peso máximo de una foto (5 MB). El backend manda; el front solo lo anticipa. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Tipos admitidos (el backend verifica por contenido, no por extensión). */
export const ACCEPTED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/** Valor del atributo `accept` del `<input type="file">`. */
export const IMAGE_ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(",");

/** `6815744` → `"6,5 MB"`. */
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Anticipa las reglas del backend para un archivo. Devuelve la causa legible
 * (con el nombre del archivo) o `null` si se puede subir:
 * - tipo distinto de JPEG/PNG/WEBP → "formato no admitido";
 * - vacío (0 bytes);
 * - más de 5 MB → indica el peso real.
 */
export function validateImageFile(
  file: Pick<File, "name" | "size" | "type">,
): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name}: formato no admitido. Usá JPEG, PNG o WEBP.`;
  }
  if (file.size === 0) return `${file.name}: el archivo está vacío.`;
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: pesa ${formatFileSize(file.size)} y el máximo es 5 MB.`;
  }
  return null;
}

/**
 * Separa los archivos elegidos en válidos (en el mismo orden en que se
 * eligieron) y rechazados (con su causa). Los inválidos no frenan a los demás.
 */
export function splitValidFiles<T extends Pick<File, "name" | "size" | "type">>(
  files: readonly T[],
): { valid: T[]; rejected: string[] } {
  const valid: T[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    const reason = validateImageFile(file);
    if (reason) rejected.push(reason);
    else valid.push(file);
  }
  return { valid, rejected };
}

// ─── Orden y agrupación ────────────────────────────────────────────────────

/**
 * Orden de visualización de las fotos de **un** color: la principal siempre
 * primero; el resto por `sort_order` y, ante empates o repetidos, por `id`.
 * No modifica la lista recibida.
 */
export function sortGalleryImages<T extends ProductImageItem>(
  images: readonly T[],
): T[] {
  return [...images].sort(
    (a, b) =>
      Number(b.is_primary) - Number(a.is_primary) ||
      a.sort_order - b.sort_order ||
      a.id - b.id,
  );
}

/** Color con lo mínimo para mostrarlo. */
export type ColorRef = Pick<Color, "id" | "name" | "hex">;

/** Sección de la pestaña Imágenes: un color con sus fotos ya ordenadas. */
export interface ColorSection {
  color: ColorRef;
  /** Fotos del color en orden de visualización (principal primero). */
  images: ProductImageItem[];
  /** Talles de las variantes de este color, por `order` (vacío si no tiene variantes). */
  sizeNames: string[];
}

/**
 * Arma las secciones de colores: primero los colores de las **variantes**
 * (en el orden en que llegan), después los que solo tienen fotos y por último
 * los agregados a mano en la pestaña ("Fotos de otro color"). Cada sección
 * trae sus fotos en orden de visualización y los talles de sus variantes.
 *
 * El nombre de un color que solo tiene fotos sale de `knownColors` (el
 * catálogo, si se puede ver); si no está se muestra "Color {id}".
 *
 * @param variants Variantes activas del producto.
 * @param images Fotos activas del producto.
 * @param extraColors Colores agregados localmente (secciones vacías).
 * @param knownColors Catálogo de colores para resolver nombres.
 */
export function buildColorSections({
  variants,
  images,
  extraColors = [],
  knownColors = [],
}: {
  variants: readonly ProductVariantItem[];
  images: readonly ProductImageItem[];
  extraColors?: readonly ColorRef[];
  knownColors?: readonly ColorRef[];
}): ColorSection[] {
  const sizesByColor = new Map<number, Map<number, Size>>();
  const colors = new Map<number, ColorRef>();
  for (const variant of variants) {
    colors.set(variant.color.id, variant.color);
    const sizes = sizesByColor.get(variant.color.id) ?? new Map();
    sizes.set(variant.size.id, variant.size);
    sizesByColor.set(variant.color.id, sizes);
  }
  const imagesByColor = new Map<number, ProductImageItem[]>();
  for (const image of images) {
    const list = imagesByColor.get(image.color) ?? [];
    list.push(image);
    imagesByColor.set(image.color, list);
    if (!colors.has(image.color)) {
      colors.set(
        image.color,
        knownColors.find((c) => c.id === image.color) ?? {
          id: image.color,
          name: `Color ${image.color}`,
          hex: "",
        },
      );
    }
  }
  for (const color of extraColors) {
    if (!colors.has(color.id)) colors.set(color.id, color);
  }
  return [...colors.values()].map((color) => ({
    color,
    images: sortGalleryImages(imagesByColor.get(color.id) ?? []),
    sizeNames: [...(sizesByColor.get(color.id)?.values() ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((size) => size.name),
  }));
}

/**
 * Foto efectiva de un color (la que se ve en la columna Foto): la principal
 * y, si no hay, la de menor orden; `null` si el color no tiene fotos.
 */
export function effectiveImage(
  images: readonly ProductImageItem[],
  colorId: number,
): ProductImageItem | null {
  return (
    sortGalleryImages(images.filter((image) => image.color === colorId))[0] ??
    null
  );
}

/** Texto de talles: `["S"]` → "talle S"; `["S","M"]` → "talles S y M"; `["S","M","L"]` → "talles S, M y L"; `[]` → `""`. */
export function formatSizeNames(names: readonly string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return `talle ${names[0]}`;
  return `talles ${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

/** `1` → "1 foto"; `4` → "4 fotos". */
export const photosText = (count: number) =>
  `${count} ${count === 1 ? "foto" : "fotos"}`;

/**
 * Resumen de una sección: "4 fotos · 1 principal · talles S y M" o, sin
 * fotos, "Sin fotos todavía · talle M". Una sección con fotos pero sin
 * principal lo dice ("sin principal").
 */
export function describeSection(section: ColorSection): string {
  const sizes = formatSizeNames(section.sizeNames);
  const count = section.images.length;
  const parts =
    count === 0
      ? ["Sin fotos todavía"]
      : [
          photosText(count),
          section.images.some((image) => image.is_primary)
            ? "1 principal"
            : "sin principal",
        ];
  if (sizes) parts.push(sizes);
  return parts.join(" · ");
}

/** Resumen de fotos del producto. */
export interface ImagesSummary {
  photos: number;
  colorsTotal: number;
  colorsWithPhotos: number;
  /** Colores sin ninguna foto. */
  colorsWithoutPhotos: ColorRef[];
}

/** Cuenta fotos y colores con/sin fotos a partir de las secciones. */
export function summarizeImages(
  sections: readonly ColorSection[],
): ImagesSummary {
  const without = sections.filter((s) => s.images.length === 0);
  return {
    photos: sections.reduce((total, s) => total + s.images.length, 0),
    colorsTotal: sections.length,
    colorsWithPhotos: sections.length - without.length,
    colorsWithoutPhotos: without.map((s) => s.color),
  };
}

// ─── Publicar exige una foto ───────────────────────────────────────────────

/** Cambio hipotético sobre el producto para anticipar la regla de publicación. */
export interface PublicationChange {
  /** Como si esta foto no existiera (eliminarla). */
  withoutImageId?: number;
  /** Como si esta variante no existiera (eliminarla). */
  withoutVariantId?: number;
  /** Como si esta foto pasara a otro color (cambiarle el color). */
  imageToColor?: { id: number; color: number };
}

/**
 * Regla del backend para publicar: **al menos una variante activa tiene al
 * menos una foto activa de su color**. Se usa para habilitar el interruptor
 * "Mostrar en la tienda online" y, con `change`, para anticipar acciones
 * hipotéticas ("¿y si eliminara esta foto / esta variante / le cambiara el
 * color?").
 *
 * @param variants Variantes activas del producto.
 * @param images Fotos activas del producto.
 * @param change Cambio hipotético a evaluar (opcional).
 */
export function canPublish(
  variants: readonly ProductVariantItem[],
  images: readonly ProductImageItem[],
  change: PublicationChange = {},
): boolean {
  const photoColors = new Set(
    images
      .filter((image) => image.id !== change.withoutImageId)
      .map((image) =>
        image.id === change.imageToColor?.id
          ? change.imageToColor.color
          : image.color,
      ),
  );
  return variants.some(
    (variant) =>
      variant.id !== change.withoutVariantId &&
      photoColors.has(variant.color.id),
  );
}

/**
 * `true` si el producto hoy cumple la regla y el `change` hipotético la
 * rompería. Un producto **publicado** no puede quedar sin ninguna variante con
 * foto: en ese caso la acción se deshabilita con una ayuda y se ofrece
 * "Despublicar". (Si ya no la cumplía antes, no hay nada que proteger.)
 */
export function wouldBreakPublication(
  variants: readonly ProductVariantItem[],
  images: readonly ProductImageItem[],
  change: PublicationChange,
): boolean {
  return canPublish(variants, images) && !canPublish(variants, images, change);
}

// ─── Movimiento y renumeración ─────────────────────────────────────────────

/** Cambio de `sort_order` de una foto. */
export interface SortOrderPatch {
  id: number;
  sort_order: number;
}

/** Resultado de reordenar: la lista nueva y los `PATCH` mínimos para persistirla. */
export interface ImageOrderPlan {
  /** Fotos del color en el nuevo orden, con `sort_order` ya renumerado 0..n-1. */
  ordered: ProductImageItem[];
  /** Solo las fotos cuyo `sort_order` cambió. */
  patches: SortOrderPatch[];
}

/** Índice desde el cual se pueden mover fotos: 1 si hay principal (va siempre primera y no se mueve), 0 si no. */
const firstMovableIndex = (list: readonly ProductImageItem[]) =>
  list[0]?.is_primary ? 1 : 0;

/**
 * Mueve la foto de la posición `fromIndex` a `toIndex` (posiciones del orden
 * de visualización de **un** color) y renumera `sort_order` a `0..n-1`. Solo
 * devuelve como `patches` las fotos cuyo valor cambió (no existe un endpoint
 * de reordenamiento masivo). Tolera `sort_order` con huecos o repetidos
 * (desempata por `id`).
 *
 * - La principal va siempre primera: no se puede mover y nadie pasa por
 *   delante (un destino anterior al primer lugar movible se ajusta a él).
 * - `null` si no hay nada que hacer (origen inválido, es la principal o el
 *   destino es el mismo lugar).
 *
 * @param images Fotos del color (en cualquier orden; se reordenan para mostrar).
 */
export function reorderImages(
  images: readonly ProductImageItem[],
  fromIndex: number,
  toIndex: number,
): ImageOrderPlan | null {
  const list = sortGalleryImages(images);
  const first = firstMovableIndex(list);
  if (fromIndex < first || fromIndex >= list.length) return null;
  const target = Math.min(Math.max(toIndex, first), list.length - 1);
  if (target === fromIndex) return null;
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(target, 0, moved);
  const before = new Map(list.map((image) => [image.id, image.sort_order]));
  const ordered = next.map((image, index) => ({ ...image, sort_order: index }));
  const patches = ordered
    .filter((image) => image.sort_order !== before.get(image.id))
    .map(({ id, sort_order }) => ({ id, sort_order }));
  return patches.length === 0 ? null : { ordered, patches };
}

/** `reorderImages` para "una posición a la izquierda (-1) / derecha (+1)". */
export function moveImage(
  images: readonly ProductImageItem[],
  imageId: number,
  direction: -1 | 1,
): ImageOrderPlan | null {
  const index = sortGalleryImages(images).findIndex((i) => i.id === imageId);
  if (index < 0) return null;
  return reorderImages(images, index, index + direction);
}

/**
 * Qué flechas están disponibles para una foto: la principal no se mueve; la
 * segunda no puede subir sobre la principal; la última no puede bajar.
 */
export function canMoveImage(
  images: readonly ProductImageItem[],
  imageId: number,
): { left: boolean; right: boolean } {
  const list = sortGalleryImages(images);
  const index = list.findIndex((i) => i.id === imageId);
  if (index < 0 || list[index].is_primary) return { left: false, right: false };
  return {
    left: index > firstMovableIndex(list),
    right: index < list.length - 1,
  };
}

/** Aplica cambios de `sort_order` a una lista de fotos (para la caché optimista). */
export function applySortOrders<T extends ProductImageItem>(
  images: readonly T[],
  patches: readonly SortOrderPatch[],
): T[] {
  const byId = new Map(patches.map((p) => [p.id, p.sort_order]));
  return images.map((image) =>
    byId.has(image.id) ? { ...image, sort_order: byId.get(image.id)! } : image,
  );
}

/** Marca `imageId` como la principal de su color y desmarca a las demás de ese color (como hace el backend). */
export function applyPrimary<T extends ProductImageItem>(
  images: readonly T[],
  imageId: number,
): T[] {
  const target = images.find((image) => image.id === imageId);
  if (!target) return [...images];
  return images.map((image) =>
    image.color === target.color
      ? { ...image, is_primary: image.id === imageId }
      : image,
  );
}

/** `sort_order` para una foto que va al final de una galería: mayor actual + 1 (0 si está vacía). */
export function nextSortOrder(images: readonly { sort_order: number }[]) {
  return images.reduce((max, image) => Math.max(max, image.sort_order), -1) + 1;
}

// ─── Edición desde el panel de detalle ─────────────────────────────────────

/** Borrador del panel de detalle. `position` es el índice (0..n-1) en la galería de su color. */
export interface ImageDraft {
  alt_text: string;
  color: number;
  is_primary: boolean;
  position: number;
}

/** Qué hay que enviar para guardar el panel de detalle. */
export interface ImageUpdatePlan {
  /** `PATCH` de la foto editada (solo lo que cambió; `{}` si nada). */
  patch: UpdateProductImageRequest;
  /** `PATCH` de `sort_order` de **otras** fotos que hay que renumerar al mover esta. */
  reorder: SortOrderPatch[];
}

/**
 * Calcula qué enviar al guardar el panel de detalle, comparando el borrador
 * con la foto:
 * - `alt_text` (recortado) si cambió;
 * - **cambio de color**: `color`, `is_primary: false` (para no desmarcar la
 *   principal del color destino) y `sort_order` al final del destino; la
 *   posición y la principal del borrador se ignoran;
 * - mismo color: `is_primary: true` si se marcó (el backend desmarca a la
 *   anterior) o, si no, el cambio de posición (`reorderImages`): el
 *   `sort_order` de la foto va en su propio `patch` y el de las demás
 *   afectadas en `reorder`.
 *
 * @param image Foto editada (estado actual).
 * @param colorImages Fotos de su color actual (incluida ella).
 * @param destinationImages Fotos del color elegido en el borrador (solo se usa si es otro).
 * @param draft Valores del panel.
 */
export function planImageUpdate(
  image: ProductImageItem,
  colorImages: readonly ProductImageItem[],
  destinationImages: readonly ProductImageItem[],
  draft: ImageDraft,
): ImageUpdatePlan {
  const patch: UpdateProductImageRequest = {};
  const reorder: SortOrderPatch[] = [];
  const alt = draft.alt_text.trim();
  if (alt !== image.alt_text.trim()) patch.alt_text = alt;

  if (draft.color !== image.color) {
    patch.color = draft.color;
    patch.is_primary = false;
    patch.sort_order = nextSortOrder(destinationImages);
  } else if (draft.is_primary && !image.is_primary) {
    patch.is_primary = true;
  } else {
    const current = sortGalleryImages(colorImages).findIndex(
      (i) => i.id === image.id,
    );
    const plan = reorderImages(colorImages, current, draft.position);
    for (const p of plan?.patches ?? []) {
      if (p.id === image.id) patch.sort_order = p.sort_order;
      else reorder.push(p);
    }
  }
  return { patch, reorder };
}

/** `true` si el plan tiene algo para enviar. */
export const hasImageChanges = (plan: ImageUpdatePlan) =>
  Object.keys(plan.patch).length > 0 || plan.reorder.length > 0;

// ─── Subida: orden, principal automática y cola ────────────────────────────

/** `sort_order` e `is_primary` que le corresponden a cada archivo de una tanda. */
export interface UploadSlot {
  sortOrder: number;
  isPrimary: boolean;
}

/**
 * Calcula, para una tanda de `count` archivos de un color, el `sort_order`
 * explícito de cada uno (`mayor sort_order actual + 1 + índice`, así quedan en
 * el orden en que se eligieron aunque terminen de subirse en otro) y cuál
 * se marca principal: **el primero** solo si el color no tiene ninguna
 * principal (ni confirmada ni pendiente).
 *
 * @param existingSortOrders `sort_order` de lo que ya hay en el color: fotos confirmadas **y** archivos todavía en la cola.
 * @param hasPrimary Si el color ya tiene principal (confirmada o pendiente).
 * @param count Cantidad de archivos válidos de la tanda.
 */
export function planUploadBatch(
  existingSortOrders: readonly number[],
  hasPrimary: boolean,
  count: number,
): UploadSlot[] {
  const base = existingSortOrders.reduce((max, n) => Math.max(max, n), -1) + 1;
  return Array.from({ length: count }, (_, index) => ({
    sortOrder: base + index,
    isPrimary: !hasPrimary && index === 0,
  }));
}

/** Cola con concurrencia limitada. */
export interface ConcurrencyQueue {
  /** Encola una tarea; arranca enseguida si hay lugar. La tarea debe manejar sus propios errores. */
  add: (task: () => Promise<void>) => void;
  /** Descarta las tareas que todavía no arrancaron (no toca las que están corriendo). */
  clear: () => void;
}

/**
 * Cola que corre como máximo `limit` tareas a la vez, en el orden en que se
 * agregaron. Cuando una termina (aunque falle) arranca la siguiente. Una
 * tarea que lanza no rompe la cola (el error se descarta: manejarlo dentro).
 */
export function createConcurrencyQueue(limit: number): ConcurrencyQueue {
  let running = 0;
  let waiting: (() => Promise<void>)[] = [];
  const pump = () => {
    while (running < limit && waiting.length > 0) {
      const task = waiting.shift()!;
      running += 1;
      void task()
        .catch(() => undefined)
        .finally(() => {
          running -= 1;
          pump();
        });
    }
  };
  return {
    add: (task) => {
      waiting.push(task);
      pump();
    },
    clear: () => {
      waiting = [];
    },
  };
}

// ─── Errores ───────────────────────────────────────────────────────────────

/** Estado HTTP de un error de axios o de un `ApiError` creado desde uno (`cause`). */
export function getHttpStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) return error.response?.status;
  if (error instanceof Error && error.cause) return getHttpStatus(error.cause);
  return undefined;
}

/** Cómo falló una subida. */
export type UploadErrorKind =
  "cancelled" | "storage-unconfigured" | "provider" | "invalid" | "other";

/**
 * Clasifica el error de un `POST /product-images/`:
 * - cancelación (`AbortController`) → `cancelled`;
 * - **503** → `storage-unconfigured` (todas fallarían igual: no reintentar);
 * - **502** → `provider` (falló el servidor de imágenes: se puede reintentar);
 * - **400** → `invalid`, con el mensaje de `file` (o del primer campo);
 * - cualquier otro → `other` con el mensaje del backend.
 */
export function classifyUploadError(error: unknown): {
  kind: UploadErrorKind;
  message: string;
} {
  if (axios.isCancel(error)) return { kind: "cancelled", message: "" };
  const status = getHttpStatus(error);
  const apiError = toApiError(error);
  if (status === 503) {
    return {
      kind: "storage-unconfigured",
      message: "El almacenamiento de imágenes no está configurado.",
    };
  }
  if (status === 502) {
    return {
      kind: "provider",
      message:
        "El servidor de imágenes no respondió (502). Probá de nuevo en unos minutos.",
    };
  }
  if (status === 400) {
    return {
      kind: "invalid",
      message:
        apiError.fieldErrors.file ??
        Object.values(apiError.fieldErrors)[0] ??
        apiError.message,
    };
  }
  return { kind: "other", message: apiError.message };
}
