import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/char/button";
import { AlertDialog } from "./alert-dialog";

const meta = {
  title: "Char/AlertDialog",
  component: AlertDialog,
  parameters: { layout: "centered" },
  args: {
    open: false,
    onOpenChange: () => {},
    variant: "info",
    title: "Título de la alerta",
    description: "Descripción breve de lo que pasó o de lo que se va a hacer.",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "warning", "danger", "info"],
    },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir alerta</Button>
        <AlertDialog {...args} open={open} onOpenChange={setOpen} />
      </>
    );
  },
} satisfies Meta<typeof AlertDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { variant: "success", title: "Usuario creado" },
};
export const Warning: Story = {
  args: { variant: "warning", title: "Hay cambios sin guardar" },
};
export const Danger: Story = {
  args: {
    variant: "danger",
    title: "No se pudo crear el usuario",
    description: "Ya existe un usuario con ese email.",
  },
};
export const Info: Story = { args: { variant: "info" } };
export const WithCancel: Story = {
  args: {
    variant: "danger",
    title: "¿Eliminar usuario?",
    description: "Esta acción no se puede deshacer.",
    confirmLabel: "Eliminar",
    cancelLabel: "Cancelar",
  },
};
