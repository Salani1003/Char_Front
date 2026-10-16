import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/char/button";
import { Dialog } from "./dialog";

const meta = {
  title: "Char/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  args: {
    open: false,
    onOpenChange: () => {},
    title: "Título del modal",
    description: "Descripción breve de lo que se hace acá.",
    children: null,
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
        <Dialog {...args} open={open} onOpenChange={setOpen}>
          <p className="text-sm">Contenido del modal.</p>
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Listo</Button>
          </div>
        </Dialog>
      </>
    );
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutDescription: Story = { args: { description: undefined } };
