import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ProductVariantItem } from "../interfaces/product.interface";
import { ProductVariantsSummary } from "./ProductVariantsSummary";

const color = (id: number, name: string, hex: string) => ({
  id,
  name,
  hex,
  created_at: "2026-01-01T00:00:00Z",
});
const size = (id: number, name: string, order: number) => ({
  id,
  name,
  order,
  created_at: "2026-01-01T00:00:00Z",
});
const variant = (
  id: number,
  c: ReturnType<typeof color>,
  s: ReturnType<typeof size>,
): ProductVariantItem => ({
  id,
  sku: `CHAR-${String(id).padStart(4, "0")}`,
  color: c,
  size: s,
});

const AZUL = color(1, "Azul", "#14284B");
const NEGRO = color(2, "Negro", "#111111");
const DORADO = color(3, "Dorado", "");
const ROJO = color(4, "Rojo", "#B00020");
const S = size(1, "S", 10);
const M = size(2, "M", 20);
const L = size(3, "L", 30);

const meta = {
  title: "Admin/ProductVariantsSummary",
  component: ProductVariantsSummary,
} satisfies Meta<typeof ProductVariantsSummary>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Colores con sus talles. */
export const ConVariantes: Story = {
  args: {
    count: 4,
    variants: [
      variant(1, AZUL, S),
      variant(2, AZUL, M),
      variant(3, NEGRO, L),
      variant(4, DORADO, M),
    ],
  },
};

/** Más de tres colores: se resume el resto. */
export const MuchosColores: Story = {
  args: {
    count: 4,
    variants: [
      variant(1, AZUL, S),
      variant(2, NEGRO, M),
      variant(3, DORADO, L),
      variant(4, ROJO, M),
    ],
  },
};

/** Sin `view_productvariant`: solo la cantidad. */
export const SoloCantidad: Story = { args: { count: 3 } };

/** Producto sin variantes (todavía no se puede publicar). */
export const SinVariantes: Story = { args: { count: 0, variants: [] } };
