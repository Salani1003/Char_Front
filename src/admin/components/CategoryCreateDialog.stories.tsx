import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Category } from "../interfaces/category.interface";
import { CategoryCreateDialog } from "./CategoryCreateDialog";
import {
  CatalogDialogStoryFrame,
  type MockReply,
} from "./catalogDialogStoryMocks";

const category = (
  id: number,
  name: string,
  products_count = 0,
  parent: Category | null = null,
): Category => ({
  id,
  name,
  slug: name.toLowerCase(),
  parent: parent?.id ?? null,
  parent_name: parent?.name ?? null,
  label: parent ? `${parent.name} › ${name}` : name,
  has_children: false,
  products_count,
  created_at: "2026-01-01T00:00:00Z",
});

const INDUMENTARIA = category(1, "Indumentaria");
const VESTIDOS = category(2, "Vestidos", 12);
const ENTERIZOS = category(3, "Enterizos", 0, INDUMENTARIA);

const ROOTS = {
  count: 2,
  next: null,
  previous: null,
  results: [INDUMENTARIA, VESTIDOS],
};

function Harness({
  initialName,
  post,
  roots = { kind: "ok", data: ROOTS },
}: {
  initialName: string;
  post: MockReply;
  roots?: MockReply;
}) {
  return (
    <CatalogDialogStoryFrame
      reply={(method, url) => {
        if (method === "post") return post;
        if (url.startsWith("/categories/") && url !== "/categories/")
          return { kind: "ok", data: ENTERIZOS };
        return roots;
      }}
    >
      {(args) => <CategoryCreateDialog {...args} initialName={initialName} />}
    </CatalogDialogStoryFrame>
  );
}

const meta = {
  title: "Admin/CategoryCreateDialog",
  component: Harness,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Nombre precargado; elegí "Indumentaria" como principal y mirá la vista previa "Indumentaria › Enterizos". "Vestidos" aparece deshabilitada (ya tiene productos). */
export const Initial: Story = {
  args: {
    initialName: "Enterizos",
    post: { kind: "ok", status: 201, data: ENTERIZOS },
  },
};

/** Sin nombre: "El nombre es obligatorio" bajo el campo. */
export const FieldError: Story = {
  args: {
    initialName: "",
    post: { kind: "ok", status: 201, data: ENTERIZOS },
  },
};

/** Nombre repetido entre hermanas: mensaje bajo el campo y acción "Usar «Enterizos»". */
export const DuplicateName: Story = {
  args: {
    initialName: "enterizos",
    post: {
      kind: "error",
      status: 400,
      data: {
        name: ["Ya existe la categoría «Enterizos»."],
        existing: { id: "3", name: "Enterizos" },
      },
    },
  },
};

/** El backend rechaza el padre (cambió mientras tanto): el mensaje aparece en el selector. Elegí una principal y creá. */
export const ParentError: Story = {
  args: {
    initialName: "Enterizos",
    post: {
      kind: "error",
      status: 400,
      data: {
        parent: ["La categoría «Indumentaria» ya tiene productos asignados."],
      },
    },
  },
};

/** Cargando las categorías principales: skeleton en lugar del selector. */
export const LoadingParents: Story = {
  args: {
    initialName: "Enterizos",
    post: { kind: "pending" },
    roots: { kind: "pending" },
  },
};

/** No se pudieron cargar las principales: mensaje con "Reintentar". */
export const ParentsLoadError: Story = {
  args: {
    initialName: "Enterizos",
    post: { kind: "pending" },
    roots: { kind: "error", status: 500, data: {} },
  },
};
