import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FiltersPopover } from "./filters-popover";
import type { FilterDefinition, FilterValues } from "./filters.types";

const FILTERS: FilterDefinition[] = [
  {
    key: "status",
    type: "chips",
    label: "Estado",
    options: [
      { value: "active", label: "Activos" },
      { value: "inactive", label: "Inactivos" },
    ],
  },
  {
    key: "role",
    type: "select",
    label: "Rol",
    options: [
      { value: "admin", label: "Administrador" },
      { value: "seller", label: "Vendedor" },
    ],
  },
  {
    key: "origin",
    type: "multiselect",
    label: "Origen",
    options: [
      { value: "instagram", label: "Instagram" },
      { value: "google", label: "Google" },
      { value: "other", label: "Otro" },
    ],
  },
  { key: "name", type: "text", label: "Nombre", placeholder: "Buscar…" },
  { key: "since", type: "date", label: "Desde" },
  { key: "verified", type: "checkbox", label: "Solo verificados" },
];

const meta = {
  title: "Char/FiltersPopover",
  component: FiltersPopover,
  parameters: { layout: "centered" },
  args: { filters: FILTERS, value: {}, onChange: () => {} },
  render: (args) => {
    const [value, setValue] = useState<FilterValues>(args.value);
    return <FiltersPopover {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof FiltersPopover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithActiveFilters: Story = {
  args: {
    value: { status: "active", verified: "true", origin: "instagram,google" },
  },
};
