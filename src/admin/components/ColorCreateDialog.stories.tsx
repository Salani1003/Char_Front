import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Color } from "../interfaces/color.interface";
import { ColorCreateDialog } from "./ColorCreateDialog";
import {
  CatalogDialogStoryFrame,
  type MockReply,
} from "./catalogDialogStoryMocks";

const AZUL: Color = {
  id: 5,
  name: "Azul",
  hex: "#1F4E9E",
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
        method === "post" && url.startsWith("/colors")
          ? post
          : { kind: "ok", data: AZUL }
      }
    >
      {(args) => <ColorCreateDialog {...args} initialName={initialName} />}
    </CatalogDialogStoryFrame>
  );
}

const meta = {
  title: "Admin/ColorCreateDialog",
  component: Harness,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Estado inicial "sin tono": campo vacío, "Elegir tono" y vista previa neutra. Crear sin tocar el tono no envía `hex`. */
export const Initial: Story = {
  args: {
    initialName: "azul",
    post: { kind: "ok", status: 201, data: AZUL },
  },
};

/** Sin nombre: muestra "El nombre es obligatorio". Escribí un tono inválido (ej. #12) para ver su mensaje. */
export const FieldError: Story = {
  args: { initialName: "", post: { kind: "ok", status: 201, data: AZUL } },
};

/** Nombre repetido: mensaje bajo el campo y acción "Usar «Azul»" (no crea nada). */
export const DuplicateName: Story = {
  args: {
    initialName: "AZUL",
    post: {
      kind: "error",
      status: 400,
      data: {
        name: ["Ya existe el color «Azul»."],
        existing: { id: "5", name: "Azul" },
      },
    },
  },
};

/** Guardando: el botón queda deshabilitado con "Creando…". */
export const Loading: Story = {
  args: { initialName: "Verde", post: { kind: "pending" } },
};
