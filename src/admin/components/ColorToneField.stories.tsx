import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorToneField } from "./ColorToneField";

function Harness({ initial, error }: { initial: string; error?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-96">
      <ColorToneField value={value} onChange={setValue} error={error} />
    </div>
  );
}

const meta = {
  title: "Admin/ColorToneField",
  component: Harness,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Estado inicial: sin tono. */
export const NoTone: Story = { args: { initial: "" } };

/** Con un tono elegido (coincide con el sugerido "Azul marino"). */
export const WithTone: Story = { args: { initial: "#14284B" } };

/** Código inválido con su mensaje de error. */
export const InvalidCode: Story = {
  args: {
    initial: "#12",
    error: "Ingresá un tono válido con el formato #RRGGBB (ej. #14284B)",
  },
};
