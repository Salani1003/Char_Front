import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/char/card";
import type { ImagesSummary } from "../utils/productImages";

/** Aviso de la regla "publicar exige una foto". */
export const PUBLISH_NEEDS_PHOTO =
  "Para publicar, cargá al menos una foto de algún color con variantes.";

/**
 * Tarjeta lateral "Resumen de fotos" de la pestaña Imágenes: cantidad de fotos,
 * "Colores con fotos 1 de 2" y los colores que todavía no tienen fotos.
 *
 * Si el producto tiene variantes pero ninguna con foto (`needsPhotoToPublish`)
 * lo dice: para publicar hace falta al menos una.
 *
 * @param summary Conteos calculados con `summarizeImages`.
 * @param needsPhotoToPublish Si falta una foto de algún color con variantes para poder publicar.
 */
export function ProductImagesSummaryCard({
  summary,
  needsPhotoToPublish,
}: {
  summary: ImagesSummary;
  needsPhotoToPublish?: boolean;
}) {
  const rows = [
    { label: "Fotos cargadas", value: String(summary.photos) },
    {
      label: "Colores con fotos",
      value: `${summary.colorsWithPhotos} de ${summary.colorsTotal}`,
    },
    {
      label: "Sin fotos",
      value: summary.colorsWithoutPhotos.map((c) => c.name).join(", ") || "—",
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de fotos</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-2 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
        {needsPhotoToPublish ? (
          <p className="mt-3 text-sm text-warning">{PUBLISH_NEEDS_PHOTO}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Tarjeta lateral "Cómo funcionan las fotos": formatos y peso, por color, estrella y orden. */
export function ProductImagesHelpCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cómo funcionan las fotos</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
          <li>Formatos JPEG, PNG o WEBP, hasta 5 MB cada una.</li>
          <li>
            Se cargan por color: todos los talles de un color comparten las
            mismas fotos.
          </li>
          <li>
            La estrella marca la principal: es la que se ve en la grilla de
            variantes y la primera en la tienda.
          </li>
          <li>
            Arrastrá las miniaturas o usá las flechas para cambiar el orden.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
