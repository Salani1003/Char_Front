import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster } from "@/components/char/sonner";
import { CopyableId } from "./copyable-id";

const meta = {
  title: "Char/CopyableId",
  component: CopyableId,
  parameters: { layout: "centered" },
  args: { value: "PAY-8f3a1c92" },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof CopyableId>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
