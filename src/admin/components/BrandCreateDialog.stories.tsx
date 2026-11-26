import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Brand } from "../interfaces/brand.interface";
import { BrandCreateDialog } from "./BrandCreateDialog";
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

function Harness({
  initialName,
  post,
}: {
  initialName: string;
  post: MockReply;
}) {
  return (
    <CatalogDialogStoryFrame
      reply={(method, url) =>
        method === "post" && url.startsWith("/brands")
          ? post
          : { kind: "ok", data: NIKE }
      }
    >
      {(args) => <BrandCreateDialog {...args} initialName={initialName} />}
    </CatalogDialogStoryFrame>
  );
}

const meta = {
  title: "Admin/BrandCreateDialog",
  component: Harness,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Nombre precargado desde el autocompletado ("nike"); al crear la API lo devuelve normalizado ("Nike"). */
export const Initial: Story = {
  args: { initialName: "nike", post: { kind: "ok", status: 201, data: NIKE } },
};

/** Sin nombre: "Crear y seleccionar" muestra "El nombre es obligatorio" bajo el campo. */
export const FieldError: Story = {
  args: { initialName: "", post: { kind: "ok", status: 201, data: NIKE } },
};

/** Nombre repetido: mensaje bajo el campo y acción "Usar «Nike»" (no crea nada). */
export const DuplicateName: Story = {
  args: {
    initialName: "NIKE",
    post: {
      kind: "error",
      status: 400,
      data: {
        name: ["Ya existe la marca «Nike»."],
        existing: { id: "3", name: "Nike" },
      },
    },
  },
};

/** Guardando: el botón queda deshabilitado con "Creando…". */
export const Loading: Story = {
  args: { initialName: "Adidas", post: { kind: "pending" } },
};
