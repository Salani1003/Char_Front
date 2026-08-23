import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
const meta = {
  title: "Char/Select",
  component: Select,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Elegí una opción" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">Opción 1</SelectItem>
        <SelectItem value="two">Opción 2</SelectItem>
        <SelectItem value="three">Opción 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};
export const SmallTrigger: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="sm" className="w-56">
        <SelectValue placeholder="Elegí una opción" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">Opción 1</SelectItem>
        <SelectItem value="two">Opción 2</SelectItem>
      </SelectContent>
    </Select>
  ),
};
export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Deshabilitado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">Opción 1</SelectItem>
      </SelectContent>
    </Select>
  ),
};
