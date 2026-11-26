import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FiltersPopover } from "@/components/char/filters-popover";
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
export const WithFiltersPopover: Story = {
  args: {
    actions: (
      <FiltersPopover
        filters={[
          {
            key: "status",
            type: "chips",
            label: "Estado",
            options: [
              { value: "active", label: "Activos" },
              { value: "inactive", label: "Inactivos" },
            ],
          },
        ]}
        value={{}}
        onChange={() => {}}
      />
    ),
  },
};
