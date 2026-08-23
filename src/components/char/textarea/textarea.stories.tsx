import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea";
const meta = {
  title: "Char/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  args: {
    placeholder: "Escribí un mensaje...",
  },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { "aria-invalid": true } };
