import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "@/components/char/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import { SearchBar } from "./search-bar";

const meta = {
  title: "Char/SearchBar",
  component: SearchBar,
  parameters: { layout: "padded" },
  args: {
    value: "",
    onValueChange: () => {},
    placeholder: "Buscar por nombre, email o usuario…",
  },
  render: (args) => {
    const [value, setValue] = useState("");
    return <SearchBar {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof SearchBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CustomTitle: Story = { args: { title: "Buscar clientes" } };
export const WithFilters: Story = {
  args: {
    filters: (
      <div className="flex flex-col gap-1.5">
        <Label>Estado</Label>
        <Select defaultValue="active">
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    ),
  },
};
