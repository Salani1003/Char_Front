import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pencil, Eye, Plus } from "lucide-react";
import { Button } from "@/components/char/button";
import { PageHeader } from "./page-header";
import { PageHeaderAction } from "./page-header-action";

const meta = {
  title: "Char/PageHeader",
  component: PageHeader,
  parameters: { layout: "padded" },
  args: {
    title: "Usuarios",
    description: "Gestioná los usuarios del sistema y sus permisos de acceso.",
  },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { description: undefined } };
export const WithAction: Story = {
  args: {
    actions: (
      <Button>
        <Plus /> Nuevo usuario
      </Button>
    ),
  },
};
export const WithMultipleActions: Story = {
  args: {
    actions: (
      <>
        <Button variant="secondary">Exportar</Button>
        <Button>
          <Plus /> Nuevo usuario
        </Button>
      </>
    ),
  },
};

export const IconActions: Story = {
  args: {
    title: "María Pérez",
    description: "Detalle del usuario.",
    actions: <PageHeaderAction icon={<Pencil />} label="Editar usuario" />,
  },
};
export const EditingIconActions: Story = {
  args: {
    title: "María Pérez",
    description: "Editando usuario.",
    actions: (
      <>
        <PageHeaderAction icon={<Eye />} label="Volver a ver" />
        <Button>Guardar cambios</Button>
      </>
    ),
  },
};
