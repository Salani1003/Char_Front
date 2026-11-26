import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProductImageDetailPanel } from "./ProductImageDetailPanel";
import { ApiMockProvider } from "./catalogDialogStoryMocks";
import {
  AZUL_IMAGES,
  AZUL_SECTION,
  ROJO_EMPTY_SECTION,
} from "./productImageStoryData";

const meta = {
  title: "Admin/ProductImageDetailPanel",
  component: ProductImageDetailPanel,
  decorators: [
    (Story) => (
      <ApiMockProvider reply={() => ({ kind: "ok", data: {} })}>
        <Story />
      </ApiMockProvider>
    ),
  ],
  args: {
    image: AZUL_IMAGES[1],
    sections: [AZUL_SECTION, ROJO_EMPTY_SECTION],
    productName: "Vestido Aurora",
    productId: 1,
    variants: [],
    published: false,
    canChange: true,
    canDelete: true,
    onClose: () => undefined,
  },
} satisfies Meta<typeof ProductImageDetailPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Estado A: editar (texto alternativo, color, posición, principal). */
export const EstadoA_Editar: Story = {};

/** Estado B: confirmar la eliminación dentro del mismo panel. */
export const EstadoB_ConfirmarEliminacion: Story = {
  args: { initialView: "confirm-delete" },
};

/** Estado C: el servidor de imágenes falló (502); la foto no se eliminó. */
export const EstadoC_FalloElServidor: Story = {
  args: {
    initialView: "delete-error",
    initialError:
      "No se pudo eliminar del servidor de imágenes (502). La foto no se eliminó: probá de nuevo en unos minutos.",
  },
};

/** La foto principal: el interruptor está deshabilitado y las flechas bloqueadas. */
export const FotoPrincipal: Story = { args: { image: AZUL_IMAGES[0] } };

/** Solo lectura (rol Vendedor): campos deshabilitados y sin "Eliminar foto". */
export const SoloLectura: Story = {
  args: { canChange: false, canDelete: false },
};

/** Producto publicado y esta es la única foto con variante: "Eliminar foto" deshabilitado, con ayuda y atajo para despublicar al intentar. */
export const PublicadoUltimaFoto: Story = {
  args: {
    published: true,
    variants: [
      {
        id: 1,
        sku: "CHAR-0001",
        color: { ...AZUL_SECTION.color, created_at: "" },
        size: { id: 1, name: "S", order: 10, created_at: "" },
      },
    ],
    sections: [{ ...AZUL_SECTION, images: [AZUL_IMAGES[0]] }],
    image: AZUL_IMAGES[0],
  },
};
