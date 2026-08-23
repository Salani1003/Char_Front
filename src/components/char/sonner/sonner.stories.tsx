import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { Button } from "../button";
import { Toaster } from "./sonner";
const meta = {
  title: "Char/Toast",
  component: Toaster,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Toaster>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <>
      <Button onClick={() => toast("Notificación")}>Mostrar toast</Button>
      <Toaster />
    </>
  ),
};
export const Success: Story = {
  render: () => (
    <>
      <Button onClick={() => toast.success("Cambios guardados con éxito")}>
        Mostrar éxito
      </Button>
      <Toaster />
    </>
  ),
};
export const Error: Story = {
  render: () => (
    <>
      <Button
        variant="danger"
        onClick={() => toast.error("Email o contraseña incorrectos.")}
      >
        Mostrar error
      </Button>
      <Toaster />
    </>
  ),
};
export const AllVariants: Story = {
  render: () => (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => toast("Notificación")}>Default</Button>
        <Button onClick={() => toast.success("Cambios guardados con éxito")}>
          Success
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.info("Hay una nueva actualización")}
        >
          Info
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.warning("Revisá los datos antes de continuar")}
        >
          Warning
        </Button>
        <Button
          variant="danger"
          onClick={() => toast.error("Email o contraseña incorrectos.")}
        >
          Error
        </Button>
      </div>
      <Toaster />
    </>
  ),
};
