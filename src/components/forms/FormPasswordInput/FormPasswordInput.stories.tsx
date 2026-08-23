import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { FormPasswordInput } from "./FormPasswordInput";
type FormValues = { password: string };
function FormPasswordInputHarness(
  props: Omit<
    React.ComponentProps<typeof FormPasswordInput<FormValues>>,
    "control" | "name"
  >,
) {
  const { control } = useForm<FormValues>({ defaultValues: { password: "" } });
  return <FormPasswordInput {...props} name="password" control={control} />;
}
const meta = {
  title: "Forms/FormPasswordInput",
  component: FormPasswordInputHarness,
  parameters: { layout: "centered" },
  args: {
    label: "Contraseña",
    placeholder: "••••••••",
  },
} satisfies Meta<typeof FormPasswordInputHarness>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <FormPasswordInputHarness {...args} />
    </div>
  ),
};
export const WithForgotPasswordAction: Story = {
  render: (args) => (
    <div className="w-72">
      <FormPasswordInputHarness
        {...args}
        action={
          <a className="text-xs text-muted-foreground hover:underline" href="#">
            ¿La olvidaste?
          </a>
        }
      />
    </div>
  ),
};
