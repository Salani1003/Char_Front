import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Size } from "../interfaces/size.interface";
import { SizeCreateDialog } from "./SizeCreateDialog";
import {
  CatalogDialogStoryFrame,
  type MockReply,
} from "./catalogDialogStoryMocks";

const size = (id: number, name: string, order: number): Size => ({
  id,
  name,
  order,
  created_at: "2026-01-01T00:00:00Z",
});

const FEW = ["XS", "S", "M", "L", "XL"].map((n, i) =>
  size(i + 1, n, (i + 1) * 10),
);
const MANY = [
  ...["34", "36", "38", "40", "42", "44", "46"].map((n, i) =>
    size(i + 1, n, (i + 1) * 10),
  ),
  ...["XS", "S", "M", "L", "XL"].map((n, i) => size(i + 10, n, (i + 8) * 10)),
];

function Harness({
  initialName,
  sizes,
  post,
}: {
  initialName: string;
  sizes: Size[];
  post: MockReply;
}) {
  return (
    <CatalogDialogStoryFrame
      reply={(method, url) => {
        if (method === "post") return post;
        if (url === "/sizes/")
          return {
            kind: "ok",
            data: {
              count: sizes.length,
              next: null,
              previous: null,
              results: sizes,
            },
          };
        return { kind: "ok", data: size(5, "XL", 50) };
      }}
    >
      {(args) => <SizeCreateDialog {...args} initialName={initialName} />}
    </CatalogDialogStoryFrame>
  );
}

const meta = {
  title: "Admin/SizeCreateDialog",
  component: Harness,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Escribí "xxl" (se ve "XXL"); el orden sugerido es 60 y al cambiarlo el talle se mueve en la vista previa. */
export const Initial: Story = {
  args: {
    initialName: "xxl",
    sizes: FEW,
    post: { kind: "ok", status: 201, data: size(6, "XXL", 60) },
  },
};

/** Sin talles cargados: el orden sugerido es 10. */
export const NoSizes: Story = {
  args: {
    initialName: "",
    sizes: [],
    post: { kind: "ok", status: 201, data: size(1, "ÚNICO", 10) },
  },
};

/** Muchos talles: la vista previa se resume con "…" alrededor del nuevo. Probá orden 55. */
export const ManySizes: Story = {
  args: {
    initialName: "XXL",
    sizes: MANY,
    post: { kind: "ok", status: 201, data: size(20, "XXL", 130) },
  },
};

/** Nombre repetido: mensaje bajo el campo y acción "Usar «XL»". */
export const DuplicateName: Story = {
  args: {
    initialName: "xl",
    sizes: FEW,
    post: {
      kind: "error",
      status: 400,
      data: {
        name: ["Ya existe el talle «XL»."],
        existing: { id: "5", name: "XL" },
      },
    },
  },
};
