import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { Breadcrumb } from "./breadcrumb";

const meta = {
  title: "Char/Breadcrumb",
  component: Breadcrumb,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    items: [
      { label: "Inicio", to: "/admin" },
      { label: "Usuarios", to: "/admin/users" },
      { label: "María Pérez" },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TwoLevels: Story = {
  args: {
    items: [{ label: "Inicio", to: "/admin" }, { label: "Clientes" }],
  },
};
