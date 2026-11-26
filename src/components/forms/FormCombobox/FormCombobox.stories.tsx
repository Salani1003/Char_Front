import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { FormCombobox } from "./FormCombobox";

interface Brand {
  id: number;
  name: string;
}

const BRANDS: Brand[] = [
  { id: 1, name: "Adidas" },
  { id: 2, name: "Nike" },
  { id: 3, name: "Puma" },
];

type FormValues = { brand: Brand | null };

function FormComboboxHarness() {
  const { control } = useForm<FormValues>({
    defaultValues: { brand: null },
    mode: "onTouched",
  });
  return (
    <div className="w-72">
      <FormCombobox<FormValues, Brand>
        label="Marca"
        name="brand"
        control={control}
        required
        description="Podés crearla desde acá."
        rules={{ required: "Elegí una marca" }}
        options={BRANDS}
        getOptionKey={(b) => b.id}
        getOptionLabel={(b) => b.name}
        placeholder="Buscá una marca"
        clearable
      />
    </div>
  );
}

const meta = {
  title: "Forms/FormCombobox",
  component: FormComboboxHarness,
  parameters: { layout: "centered" },
} satisfies Meta<typeof FormComboboxHarness>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
