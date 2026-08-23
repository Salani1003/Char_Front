import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
const meta = {
  title: "Char/Label",
  component: Label,
  parameters: { layout: "centered" },
  args: {
    children: "Nombre",
  },
} satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Required: Story = { args: { required: true } };
