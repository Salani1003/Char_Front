import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { FormMoneyInput } from "./FormMoneyInput";

type FormValues = { price: string };

function Harness({ initial, error }: { initial: string; error?: string }) {
  const { control } = useForm<FormValues>({
    defaultValues: { price: initial },
    errors: error ? { price: { type: "custom", message: error } } : undefined,
  });
  return (
    <div className="w-72">
      <FormMoneyInput
        label="Precio de venta"
        name="price"
        control={control}
        required
        description="Escribí 90000 o 90.000,00: al salir del campo se da formato."
      />
    </div>
  );
}

const meta = {
  title: "Forms/FormMoneyInput",
  component: Harness,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Vacío: escribí `90000` y salí del campo, queda `90.000,00`. */
export const Default: Story = { args: { initial: "" } };

/** Con un importe ya formateado. */
export const WithValue: Story = { args: { initial: "90.000,00" } };

/** Con error de validación. */
export const WithError: Story = {
  args: { initial: "abc", error: "Ingresá un importe válido" },
};
