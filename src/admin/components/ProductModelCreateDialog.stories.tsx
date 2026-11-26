import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Brand } from "../interfaces/brand.interface";
import type { ProductModel } from "../interfaces/product-model.interface";
import { ProductModelCreateDialog } from "./ProductModelCreateDialog";
import {
  CatalogDialogStoryFrame,
  type MockReply,
} from "./catalogDialogStoryMocks";

const NIKE: Brand = {
  id: 3,
  name: "Nike",
  slug: "nike",
  created_at: "2026-01-01T00:00:00Z",
};
const ESTRELLA: ProductModel = {
  id: 9,
  name: "Estrella",
  brand: 3,
  created_at: "2026-01-01T00:00:00Z",
};

function Harness({
  initialName,
  brandId,
  post,
}: {
  initialName: string;
  brandId: number | null;
  post: MockReply;
}) {
  return (
    <CatalogDialogStoryFrame
      reply={(method, url) => {
        if (method === "post") return post;
        if (url.startsWith("/product-models/"))
          return { kind: "ok", data: ESTRELLA };
        if (url === "/brands/")
          return {
            kind: "ok",
            data: { count: 1, next: null, previous: null, results: [NIKE] },
          };
        return { kind: "ok", data: NIKE };
      }}
    >
      {({ onCreated, ...args }) => (
        <ProductModelCreateDialog
          {...args}
          onCreated={(model, brand) => onCreated({ model, brand })}
          initialName={initialName}
          brandId={brandId}
        />
      )}
    </CatalogDialogStoryFrame>
  );
}

const meta = {
  title: "Admin/ProductModelCreateDialog",
  component: Harness,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Con la marca ya elegida en el formulario: viene precargada. `onCreated` entrega modelo y marca. */
export const BrandPreloaded: Story = {
  args: {
    initialName: "Estrella",
    brandId: 3,
    post: { kind: "ok", status: 201, data: ESTRELLA },
  },
};

/** Sin marca en el formulario: se elige acá (sin botón "+"). */
export const NoBrand: Story = {
  args: {
    initialName: "Estrella",
    brandId: null,
    post: { kind: "ok", status: 201, data: ESTRELLA },
  },
};

/** Nombre repetido dentro de la marca: acción "Usar «Estrella»". */
export const DuplicateName: Story = {
  args: {
    initialName: "estrella",
    brandId: 3,
    post: {
      kind: "error",
      status: 400,
      data: {
        name: ["Ya existe el modelo «Estrella» en esta marca."],
        existing: { id: "9", name: "Estrella" },
      },
    },
  },
};

/** Guardando: botón deshabilitado con "Creando…". */
export const Loading: Story = {
  args: {
    initialName: "Estrella",
    brandId: 3,
    post: { kind: "pending" },
  },
};
