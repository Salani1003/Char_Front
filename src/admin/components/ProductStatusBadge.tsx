import { Badge } from "@/components/char/badge";

/**
 * Estado de publicación de un producto: "Publicado" (`success`) o "Sin
 * publicar" (`secondary`).
 *
 * @param published Valor de `is_published`.
 */
export function ProductStatusBadge({ published }: { published: boolean }) {
  return (
    <Badge variant={published ? "success" : "secondary"}>
      {published ? "Publicado" : "Sin publicar"}
    </Badge>
  );
}
