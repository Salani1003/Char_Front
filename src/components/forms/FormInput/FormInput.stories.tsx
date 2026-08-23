import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { FormInput } from "./FormInput";
type FormValues = { email: string };
function FormInputHarness(
  props: Omit<
    React.ComponentProps<typeof FormInput<FormValues>>,
    "control" | "name"
  >,
) {
  const { control } = useForm<FormValues>({ defaultValues: { email: "" } });
  return <FormInput {...props} name="email" control={control} />;
}
const meta = {
  title: "Forms/FormInput",
  component: FormInputHarness,
  parameters: { layout: "centered" },
  args: {
    label: "Email",
    placeholder: "tu@email.com",
  },
} satisfies Meta<typeof FormInputHarness>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <FormInputHarness {...args} />
    </div>
  ),
};
export const WithError: Story = {
  render: () => {
    const { control } = useForm<FormValues>({
      defaultValues: { email: "" },
      mode: "onChange",
    });
    return (
      <div className="w-72">
        <FormInput
          label="Email"
          name="email"
          control={control}
          rules={{ required: "El email es obligatorio" }}
        />
      </div>
    );
  },
};
