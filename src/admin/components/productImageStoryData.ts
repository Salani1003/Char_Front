import type { UploadItem } from "../hooks/useImageUploadQueue";
import type { ProductImageItem } from "../interfaces/product-image.interface";
import type { ColorSection } from "../utils/productImages";

/** Datos de ejemplo SOLO para las stories de fotos de producto. */

/** Imagen de relleno (SVG en un data URI) para no depender de la red. */
const placeholder = (label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#cbd5e1"/><text x="200" y="210" font-size="32" text-anchor="middle" fill="#334155">${label}</text></svg>`,
  )}`;

export const image = (
  id: number,
  color: number,
  label: string,
  sortOrder: number,
  isPrimary = false,
): ProductImageItem => ({
  id,
  color,
  url: placeholder(label),
  thumbnail_url: placeholder(label),
  alt_text: label,
  sort_order: sortOrder,
  is_primary: isPrimary,
});

export const AZUL = { id: 1, name: "Azul", hex: "#14284B" };
export const ROJO = { id: 2, name: "Rojo", hex: "#B00020" };

export const AZUL_IMAGES = [
  image(1, 1, "Frente", 0, true),
  image(2, 1, "Espalda", 1),
  image(3, 1, "Detalle", 2),
  image(4, 1, "Look", 3),
];

export const AZUL_SECTION: ColorSection = {
  color: AZUL,
  images: AZUL_IMAGES,
  sizeNames: ["S", "M"],
};

export const ROJO_EMPTY_SECTION: ColorSection = {
  color: ROJO,
  images: [],
  sizeNames: ["M"],
};

export const upload = (
  id: string,
  name: string,
  changes: Partial<UploadItem>,
): UploadItem => ({
  id,
  colorId: 2,
  file: new File([], name, { type: "image/jpeg" }),
  sortOrder: 0,
  isPrimary: false,
  batchId: 1,
  status: "uploading",
  progress: 0,
  ...changes,
});
