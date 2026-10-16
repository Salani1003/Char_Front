import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { FormCheckboxGroup } from "./FormCheckboxGroup";

type FormValues = { groups: number[] };

function FormCheckboxGroupHarness(
  props: Omit<
    React.ComponentProps<typeof FormCheckboxGroup<FormValues>>,
    "control" | "name"
  >,
) {
  const { control } = useForm<FormValues>({ defaultValues: { groups: [1] } });
  return <FormCheckboxGroup {...props} name="groups" control={control} />;
}

const meta = {
  title: "Forms/FormCheckboxGroup",
  component: FormCheckboxGroupHarness,
  parameters: { layout: "centered" },
  args: {
    label: "Grupos",
    options: [
      { value: 1, label: "Administradores" },
      { value: 2, label: "Ventas" },
      { value: 3, label: "Soporte" },
    ],
  },
} satisfies Meta<typeof FormCheckboxGroupHarness>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <FormCheckboxGroupHarness {...args} />
    </div>
  ),
};
export const Empty: Story = {
  args: { options: [] },
  render: (args) => (
    <div className="w-96">
      <FormCheckboxGroupHarness {...args} />
    </div>
  ),
};
