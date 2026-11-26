import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/char/sonner";
import { uploadProductImageAction } from "../actions/product-images.action";
import type { ProductImageItem } from "../interfaces/product-image.interface";
import {
  classifyUploadError,
  createConcurrencyQueue,
  photosText,
  planUploadBatch,
  splitValidFiles,
} from "../utils/productImages";
import { refreshProductImages } from "./useProductImages";

/** Cuántas subidas corren a la vez. */
const UPLOAD_CONCURRENCY = 3;

/** Estado de un archivo en la cola de subida. */
export type UploadStatus = "queued" | "uploading" | "error" | "done";

/** Un archivo de la cola: se muestra como un elemento más de la grilla de su color. */
export interface UploadItem {
  id: string;
  colorId: number;
  file: File;
  /** `sort_order` explícito (respeta el orden de selección). */
  sortOrder: number;
  isPrimary: boolean;
  batchId: number;
  status: UploadStatus;
  /** 0–100 mientras sube. */
  progress: number;
  /** Causa legible cuando `status` es `error`. */
  error?: string;
  /** Miniatura devuelta por la API cuando `status` es `done` (hasta que la galería se refresca). */
  thumbnailUrl?: string | null;
}

/** Contadores de una tanda de archivos elegidos juntos (para el toast final). */
interface BatchMeta {
  total: number;
  succeeded: number;
  reported: boolean;
}

/**
 * Cola de subida de fotos de un producto. Un `POST` por archivo, con hasta 3 en
 * paralelo (`createConcurrencyQueue`), en el orden en que se eligieron.
 *
 * - `enqueue(colorId, files, confirmed)`: rechaza antes de subir los archivos
 *   inválidos (tipo/peso) avisando la causa, sin frenar a los válidos; a los
 *   demás les calcula `sort_order` explícito y la principal automática
 *   (`planUploadBatch`).
 * - Cada archivo pasa por `queued` → `uploading` (progreso) → `done`, o
 *   `error` (mensaje de la causa; `retry` / `discard`). `cancel` aborta una
 *   subida en curso (`AbortController`) y refresca la galería, porque la foto
 *   pudo haberse creado igual.
 * - **503**: corta el resto de la cola (todas fallarían igual) y deja
 *   `storageUnavailable` en `true` para mostrar un único aviso.
 * - Cuando una tanda termina (todas o algunas) avisa con un toast ("Se
 *   subieron 3 fotos", "Se subieron 2 de 3 fotos"), refresca `with-variants`
 *   y quita los archivos ya listos (la galería real los muestra).
 *
 * @param productId Producto al que se suben las fotos.
 * @param announce Anuncia progreso y resultado en el *live region* de la pestaña.
 */
export function useImageUploadQueue({
  productId,
  announce,
}: {
  productId: number;
  announce: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [queue] = useState(() => createConcurrencyQueue(UPLOAD_CONCURRENCY));
  // Espejo síncrono de `items`: las tareas async necesitan el valor más reciente.
  const itemsRef = useRef<UploadItem[]>([]);
  const controllers = useRef(new Map<string, AbortController>());
  const batches = useRef(new Map<number, BatchMeta>());
  const counters = useRef({ batch: 0, item: 0 });

  const commit = (update: (current: UploadItem[]) => UploadItem[]) => {
    itemsRef.current = update(itemsRef.current);
    setItems(itemsRef.current);
  };
  const patch = (id: string, changes: Partial<UploadItem>) =>
    commit((current) =>
      current.map((i) => (i.id === id ? { ...i, ...changes } : i)),
    );

  /** Si la tanda ya no tiene nada en curso: avisa el resultado, refresca y limpia lo listo. */
  const settle = async (batchId: number) => {
    const meta = batches.current.get(batchId);
    if (!meta || meta.reported) return;
    const own = itemsRef.current.filter((i) => i.batchId === batchId);
    if (own.some((i) => i.status === "queued" || i.status === "uploading")) {
      return;
    }
    meta.reported = true;
    if (meta.total > 0 && meta.succeeded > 0) {
      const message =
        meta.succeeded === meta.total
          ? meta.total === 1
            ? "Se subió 1 foto"
            : `Se subieron ${meta.total} fotos`
          : `Se subieron ${meta.succeeded} de ${photosText(meta.total)}`;
      if (meta.succeeded === meta.total) toast.success(message);
      else toast.warning(message);
      announce(message);
    } else if (own.some((i) => i.status === "error")) {
      announce("No se pudo subir ninguna foto. Revisá los errores.");
    }
    if (own.some((i) => i.status === "done")) {
      await refreshProductImages(queryClient, productId);
      commit((current) =>
        current.filter((i) => !(i.batchId === batchId && i.status === "done")),
      );
    }
    if (!itemsRef.current.some((i) => i.batchId === batchId)) {
      batches.current.delete(batchId);
    }
  };

  const settleAll = () => {
    for (const batchId of [...batches.current.keys()]) void settle(batchId);
  };

  const startItem = (item: UploadItem) => {
    queue.add(async () => {
      const current = itemsRef.current.find((i) => i.id === item.id);
      if (current?.status !== "queued") return; // descartado antes de empezar
      const controller = new AbortController();
      controllers.current.set(item.id, controller);
      patch(item.id, { status: "uploading", progress: 0, error: undefined });
      try {
        const image = await uploadProductImageAction(
          {
            file: item.file,
            product: productId,
            color: item.colorId,
            sort_order: item.sortOrder,
            is_primary: item.isPrimary,
          },
          {
            signal: controller.signal,
            onProgress: (progress) => patch(item.id, { progress }),
          },
        );
        const meta = batches.current.get(item.batchId);
        if (meta) meta.succeeded += 1;
        patch(item.id, {
          status: "done",
          progress: 100,
          thumbnailUrl: image.thumbnail_url ?? image.url,
        });
      } catch (error) {
        const failure = classifyUploadError(error);
        if (failure.kind === "cancelled") {
          const meta = batches.current.get(item.batchId);
          if (meta) meta.total -= 1;
          commit((list) => list.filter((i) => i.id !== item.id));
          announce(`Se canceló la subida de ${item.file.name}`);
          // La foto pudo crearse en el servidor aunque la respuesta no llegó.
          void refreshProductImages(queryClient, productId);
        } else if (failure.kind === "storage-unconfigured") {
          queue.clear();
          setStorageUnavailable(true);
          commit((list) =>
            list.map((i) =>
              i.id === item.id || i.status === "queued"
                ? {
                    ...i,
                    status: "error",
                    error:
                      i.id === item.id
                        ? failure.message
                        : "No se subió: el almacenamiento de imágenes no está configurado.",
                  }
                : i,
            ),
          );
          announce(failure.message);
        } else {
          patch(item.id, { status: "error", error: failure.message });
          announce(`No se pudo subir ${item.file.name}. ${failure.message}`);
        }
      } finally {
        controllers.current.delete(item.id);
        settleAll();
      }
    });
  };

  /**
   * Agrega archivos al color `colorId`. `confirmed` son las fotos que el color
   * ya tiene (para calcular el orden y si hace falta una principal).
   */
  const enqueue = (
    colorId: number,
    files: readonly File[],
    confirmed: readonly ProductImageItem[],
  ) => {
    const { valid, rejected } = splitValidFiles(files);
    if (rejected.length > 0) {
      const text = rejected.join(" ");
      if (rejected.length === 1) toast.error(text);
      else
        toast.error(`No se subieron ${rejected.length} archivos`, {
          description: text,
        });
      announce(text);
    }
    if (valid.length === 0) return;

    const sameColor = confirmed.filter((i) => i.color === colorId);
    const pending = itemsRef.current.filter((i) => i.colorId === colorId);
    const slots = planUploadBatch(
      [
        ...sameColor.map((i) => i.sort_order),
        ...pending.map((i) => i.sortOrder),
      ],
      sameColor.some((i) => i.is_primary) || pending.some((i) => i.isPrimary),
      valid.length,
    );
    const batchId = ++counters.current.batch;
    batches.current.set(batchId, {
      total: valid.length,
      succeeded: 0,
      reported: false,
    });
    const created: UploadItem[] = valid.map((file, index) => ({
      id: `upload-${++counters.current.item}`,
      colorId,
      file,
      sortOrder: slots[index].sortOrder,
      isPrimary: slots[index].isPrimary,
      batchId,
      status: "queued",
      progress: 0,
    }));
    setStorageUnavailable(false);
    commit((current) => [...current, ...created]);
    announce(`Subiendo ${photosText(valid.length)}…`);
    created.forEach(startItem);
  };

  /** Vuelve a encolar un archivo con error. */
  const retry = (id: string) => {
    const item = itemsRef.current.find((i) => i.id === id);
    if (item?.status !== "error") return;
    const meta = batches.current.get(item.batchId);
    if (meta) meta.reported = false;
    setStorageUnavailable(false);
    patch(id, { status: "queued", progress: 0, error: undefined });
    startItem({ ...item, status: "queued" });
  };

  /** Quita un archivo de la cola (con error o todavía sin empezar). */
  const discard = (id: string) => {
    const item = itemsRef.current.find((i) => i.id === id);
    if (!item) return;
    const meta = batches.current.get(item.batchId);
    if (meta) meta.total -= 1;
    commit((list) => list.filter((i) => i.id !== id));
    settleAll();
  };

  /** Cancela una subida en curso (aborta el `POST`); si no empezó, la descarta. */
  const cancel = (id: string) => {
    const controller = controllers.current.get(id);
    if (controller) controller.abort();
    else discard(id);
  };

  return { items, enqueue, retry, discard, cancel, storageUnavailable };
}
