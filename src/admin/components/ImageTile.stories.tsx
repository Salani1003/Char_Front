import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImageTile } from "./ImageTile";
import { image } from "./productImageStoryData";

const noop = () => undefined;

const meta = {
  title: "Admin/ImageTile",
  component: ImageTile,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <ul className="w-48">
        <Story />
      </ul>
    ),
  ],
  args: {
    image: image(2, 1, "Espalda", 1),
    position: 2,
    total: 4,
    colorName: "Azul",
    canChange: true,
    canMoveLeft: true,
    canMoveRight: true,
    onOpen: noop,
    onSetPrimary: noop,
    onMove: noop,
  },
} satisfies Meta<typeof ImageTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

/** La principal: badge, estrella marcada y flechas deshabilitadas. */
export const Principal: Story = {
  args: {
    image: image(1, 1, "Frente", 0, true),
    position: 1,
    canMoveLeft: false,
    canMoveRight: false,
  },
};

/** La última: la flecha derecha está deshabilitada. */
export const Ultima: Story = {
  args: { position: 4, canMoveRight: false },
};

/** Sin permiso de cambiar: solo se abre el detalle. */
export const SoloLectura: Story = { args: { canChange: false } };

/** Sin URL (almacenamiento sin configurar). */
export const SinImagen: Story = {
  args: {
    image: { ...image(2, 1, "Espalda", 1), url: null, thumbnail_url: null },
  },
};
