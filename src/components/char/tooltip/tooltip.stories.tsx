import type { Meta, StoryObj } from "@storybook/react-vite";
import { Users } from "lucide-react";
import { Button } from "@/components/char/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
const meta = {
  title: "Char/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Clientes">
            <Users className="size-4" />
          </Button>
        }
      />
      <TooltipContent>Clientes</TooltipContent>
    </Tooltip>
  ),
};
export const Sides: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger
            render={
              <Button variant="secondary" size="sm">
                {side}
              </Button>
            }
          />
          <TooltipContent side={side}>Tooltip {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};
