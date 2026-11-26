import type { Meta, StoryObj } from "@storybook/react-vite";
import { Notice } from "./notice";

const meta = {
  title: "Char/Notice",
  component: Notice,
  parameters: { layout: "padded" },
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
    },
  },
  args: {
    variant: "info",
    children: "Texto del aviso.",
  },
} satisfies Meta<typeof Notice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};
export const Success: Story = { args: { variant: "success" } };
export const Warning: Story = {
  args: {
    variant: "warning",
    children:
      "Este producto está publicado. Podés eliminar variantes, pero no la última: para eso primero hay que despublicarlo.",
  },
};
export const Danger: Story = { args: { variant: "danger" } };
export const WithTitle: Story = {
  args: { variant: "warning", title: "Atención" },
};
