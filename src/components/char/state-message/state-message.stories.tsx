import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/char/button";
import { StateMessage } from "./state-message";

const meta = {
  title: "Char/StateMessage",
  component: StateMessage,
  parameters: { layout: "padded" },
} satisfies Meta<typeof StateMessage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { variant: "loading", children: "Cargando usuarios…" },
};
export const Empty: Story = {
  args: { variant: "empty", children: "No se encontraron usuarios." },
};
export const Error: Story = {
  args: { variant: "error", children: "No se pudo conectar con el servidor." },
};
export const ErrorWithAction: Story = {
  args: {
    variant: "error",
    children: "No se pudo conectar con el servidor.",
    action: <Button variant="secondary">Reintentar</Button>,
  },
};
