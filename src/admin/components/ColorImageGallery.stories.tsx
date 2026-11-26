import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorImageGallery } from "./ColorImageGallery";
import {
  AZUL_SECTION,
  ROJO_EMPTY_SECTION,
  upload,
} from "./productImageStoryData";

const noop = () => undefined;

const meta = {
  title: "Admin/ColorImageGallery",
  component: ColorImageGallery,
  args: {
    section: AZUL_SECTION,
    uploads: [],
    canAdd: true,
    canChange: true,
    onFiles: noop,
    onOpen: noop,
    onSetPrimary: noop,
    onReorder: noop,
    onMove: noop,
    onCancelUpload: noop,
    onRetryUpload: noop,
    onDiscardUpload: noop,
  },
} satisfies Meta<typeof ColorImageGallery>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Color con 4 fotos, una principal. */
export const ConFotos: Story = {};

/** Color sin fotos todavía: solo el recuadro "Subir fotos / o arrastralas acá". */
export const Vacia: Story = { args: { section: ROJO_EMPTY_SECTION } };

/** Un archivo subiendo (con progreso) y otro en cola, sin fotos confirmadas. */
export const Subiendo: Story = {
  args: {
    section: ROJO_EMPTY_SECTION,
    uploads: [
      upload("a", "rojo-frente.jpg", { progress: 60 }),
      upload("b", "rojo-espalda.jpg", { status: "queued", sortOrder: 1 }),
    ],
  },
};

/** Una subida que falló (502): mensaje de la causa, "Reintentar" y "Descartar". */
export const ConError: Story = {
  args: {
    section: ROJO_EMPTY_SECTION,
    uploads: [
      upload("a", "rojo-frente.jpg", { status: "done", progress: 100 }),
      upload("b", "rojo-espalda.jpg", {
        status: "error",
        error:
          "El servidor de imágenes no respondió (502). Probá de nuevo en unos minutos.",
      }),
    ],
  },
};

/** Sin permiso de cambiar ni subir (rol Vendedor): solo se ve y se abre el detalle. */
export const SoloLectura: Story = {
  args: { canAdd: false, canChange: false },
};
