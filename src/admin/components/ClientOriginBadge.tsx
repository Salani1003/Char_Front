import { Badge } from "@/components/char/badge";
import { cn } from "@/lib/utils";
import { CLIENT_ORIGIN_LABELS } from "../config/client-origins";
import type { ClientOrigin } from "../interfaces/client.interface";

/**
 * Clases de color de cada origen (tokens `--char-origin-*` vía las utilidades
 * `text-origin-*` / `bg-origin-*-bg`). Van escritas completas, no armadas con
 * template strings, para que Tailwind las detecte.
 */
const ORIGIN_STYLES: Record<ClientOrigin, string> = {
  instagram: "bg-origin-instagram-bg text-origin-instagram",
  facebook: "bg-origin-facebook-bg text-origin-facebook",
  tiktok: "bg-origin-tiktok-bg text-origin-tiktok",
  google: "bg-origin-google-bg text-origin-google",
  referral: "bg-origin-referral-bg text-origin-referral",
  physical_store: "bg-origin-physical-store-bg text-origin-physical-store",
  other: "bg-origin-other-bg text-origin-other",
};

/**
 * Chip con el origen de un cliente y su etiqueta en español. Cada canal tiene
 * su color: las redes sociales (Instagram, Facebook, TikTok, Google) usan un
 * tono de la identidad de la marca (TikTok: fondo oscuro con letras blancas) y "Recomendación", "Local físico" y "Otro"
 * usan tonos sobrios de la paleta de Char. Los colores salen de los tokens
 * `--char-origin-*` de `styles/tokens.css`. Lo usan la tabla, las tarjetas y
 * el detalle del cliente.
 *
 * @param origin Origen del cliente.
 */
export function ClientOriginBadge({ origin }: { origin: ClientOrigin }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", ORIGIN_STYLES[origin])}
    >
      {CLIENT_ORIGIN_LABELS[origin]}
    </Badge>
  );
}
