import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useAuthStore } from "@/auth/store/auth.store";
import type { CurrentUser } from "../interfaces/user.interface";
import type { Color } from "../interfaces/color.interface";
import type { ProductVariantItem } from "../interfaces/product.interface";
import type { Size } from "../interfaces/size.interface";
import { ProductVariantsPanel } from "./ProductVariantsPanel";
import { ApiMockProvider, type MockReply } from "./catalogDialogStoryMocks";

const color = (id: number, name: string, hex: string): Color => ({
  id,
  name,
  hex,
  created_at: "2026-01-01T00:00:00Z",
});
const size = (id: number, name: string, order: number): Size => ({
  id,
  name,
  order,
  created_at: "2026-01-01T00:00:00Z",
});

const COLORS = [
  color(1, "Azul", "#14284B"),
  color(2, "Negro", "#111111"),
  color(3, "Dorado", ""),
];
const SIZES = [
  ...["XS", "S", "M", "L", "XL"].map((n, i) => size(i + 1, n, (i + 1) * 10)),
  ...["38", "40", "42"].map((n, i) => size(i + 10, n, (i + 10) * 10)),
];
/** El producto ya tiene Azul / S y Azul / M. */
const EXISTING: ProductVariantItem[] = [
  { id: 1, sku: "CHAR-0001", color: COLORS[0], size: SIZES[1] },
  { id: 2, sku: "CHAR-0002", color: COLORS[0], size: SIZES[2] },
];

const page = <T,>(results: T[]): MockReply => ({
  kind: "ok",
  data: { count: results.length, next: null, previous: null, results },
});

function Harness({
  reply,
  permissions = null,
  existing = EXISTING,
}: {
  reply: (method: string, url: string, postCount: number) => MockReply;
  /** `null` = superusuario; una lista = esos permisos. */
  permissions?: string[] | null;
  existing?: ProductVariantItem[];
}) {
  const posts = useRef(0);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    useAuthStore.setState({
      user: {
        is_superuser: permissions === null,
        permissions: permissions ?? [],
      } as unknown as CurrentUser,
    });
  }, [permissions]);
  return (
    <ApiMockProvider
      reply={(method, url) => {
        if (method === "post" && url === "/product-variants/")
          posts.current += 1;
        return reply(method, url, posts.current);
      }}
    >
      {open ? (
        <ProductVariantsPanel
          productId={1}
          existing={existing}
          onClose={() => setOpen(false)}
        />
      ) : (
        <button type="button" onClick={() => setOpen(true)}>
          Reabrir panel
        </button>
      )}
    </ApiMockProvider>
  );
}

const happyReply = (method: string, url: string, post: number): MockReply => {
  if (method === "post" && url === "/product-variants/") {
    return {
      kind: "ok",
      status: 201,
      data: {
        id: 100 + post,
        product: 1,
        color: 1,
        size: 1,
        sku: `CHAR-${String(2 + post).padStart(4, "0")}`,
        created_at: "2026-01-01T00:00:00Z",
      },
    };
  }
  if (url === "/colors/") return page(COLORS);
  if (url === "/sizes/") return page(SIZES);
  return { kind: "ok", data: {} };
};

const meta = {
  title: "Admin/ProductVariantsPanel",
  component: Harness,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Sin elecciones: "Todavía no elegiste color ni talles" y "Crear" deshabilitado. Probá Azul + M, L, XL: M sale "Ya existe · se omite" y se crean 2. */
export const Initial: Story = { args: { reply: happyReply } };

/** Colores y talles cargando. */
export const Loading: Story = {
  args: {
    reply: (_method, url) =>
      url === "/colors/" || url === "/sizes/"
        ? { kind: "pending" }
        : { kind: "ok", data: {} },
  },
};

/** Falla la carga de colores y talles ("Reintentar"). */
export const LoadError: Story = {
  args: {
    reply: () => ({ kind: "error", status: 500, data: { detail: "Error" } }),
  },
};

/** Sin catálogos cargados. */
export const EmptyCatalogs: Story = {
  args: {
    reply: (_method, url) =>
      url === "/colors/" || url === "/sizes/"
        ? page([])
        : { kind: "ok", data: {} },
  },
};

/** Sin `view_color` / `view_size`: avisa que no puede armarse. */
export const NoPermission: Story = {
  args: { reply: happyReply, permissions: ["products.add_productvariant"] },
};

/** Elegí Azul + L, XL, 38 y creá: el 2.º `POST` falla (la combinación ya existe) y el panel muestra qué se creó y qué falló; "Crear" reintenta solo lo pendiente. */
export const PartialFailure: Story = {
  args: {
    reply: (method, url, post) =>
      method === "post" && url === "/product-variants/" && post === 2
        ? {
            kind: "error",
            status: 400,
            data: {
              non_field_errors: ["Ya existe esa combinación de color y talle."],
            },
          }
        : happyReply(method, url, post),
  },
};
