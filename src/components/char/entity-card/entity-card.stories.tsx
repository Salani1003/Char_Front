import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays, Clock, Pencil } from "lucide-react";
import { Badge } from "@/components/char/badge";
import { PageHeaderAction } from "@/components/char/page-header";
import { EntityCard } from "./entity-card";

const meta = {
  title: "Char/EntityCard",
  component: EntityCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "María Pérez",
    subtitle: "maria.perez@char.com",
    badge: <Badge variant="success">Activo</Badge>,
    details: [
      { icon: <CalendarDays />, label: "Alta", value: "12/03/2025" },
      { icon: <Clock />, label: "Último acceso", value: "Hoy, 09:41" },
    ],
  },
} satisfies Meta<typeof EntityCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithActions: Story = {
  args: {
    actions: <PageHeaderAction icon={<Pencil />} label="Editar usuario" />,
  },
};
export const Minimal: Story = {
  args: { badge: undefined, details: undefined },
};
