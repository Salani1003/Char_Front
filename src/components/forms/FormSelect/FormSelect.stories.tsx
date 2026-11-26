import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { FormSelect } from "./FormSelect";

type FormValues = { origin: string };

const OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "google", label: "Google" },
  { value: "other", label: "Otro" },
];

function FormSelectHarness({ withError }: { withError?: boolean }) {
  const { control } = useForm<FormValues>({
    defaultValues: { origin: "" },
    mode: "onChange",
  });
  return (
    <div className="w-72">
      <FormSelect
        label="Origen"
        name="origin"
        control={control}
        options={OPTIONS}
        placeholder="Elegí un origen"
        rules={withError ? { required: "Elegí un origen" } : undefined}
      />
    </div>
  );
}

const meta = {
  title: "Forms/FormSelect",
  component: FormSelectHarness,
  parameters: { layout: "centered" },
} satisfies Meta<typeof FormSelectHarness>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
