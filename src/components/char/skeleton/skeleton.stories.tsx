import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Char/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = { args: { className: "h-4 w-48" } };
export const Avatar: Story = { args: { className: "size-12 rounded-full" } };
export const Card: Story = {
  render: () => (
    <div role="status" className="flex w-72 flex-col gap-3">
      <span className="sr-only">Cargando…</span>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  ),
};
