import { Badge } from "@/components/char/badge";
import { DOC_STATUS_LABELS, type DocStatus } from "../config/sales";

const VARIANTS = { completada: "success", anulada: "danger" } as const;

/**
 * Insignia del estado de una venta o de un cambio: Completada (verde) o
 * Anulada (rojo).
 *
 * @param status Estado del documento.
 */
export function DocStatusBadge({ status }: { status: DocStatus }) {
  return <Badge variant={VARIANTS[status]}>{DOC_STATUS_LABELS[status]}</Badge>;
}
