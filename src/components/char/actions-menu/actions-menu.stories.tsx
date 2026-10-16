import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pencil, Trash2 } from "lucide-react";
import { ActionsMenu } from "./actions-menu";

const meta = {
  title: "Char/ActionsMenu",
  component: ActionsMenu,
  parameters: { layout: "centered" },
  args: {
    label: "Acciones",
    items: [
      { label: "Editar", icon: <Pencil />, onSelect: () => {} },
      {
        label: "Eliminar",
        icon: <Trash2 />,
        onSelect: () => {},
        variant: "danger",
      },
    ],
  },
} satisfies Meta<typeof ActionsMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
