import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, Trash2 } from "lucide-react";
import { Button, type CharButtonVariant } from "./button";

/**
 * Todas las variantes del botón y para qué se usa cada una. Es un `Record`
 * sobre `CharButtonVariant`: si se agrega una variante al componente, TypeScript
 * obliga a describirla acá y aparece sola en las historias y en el control.
 */
const VARIANT_USAGE: Record<CharButtonVariant, string> = {
  primary: "Acción principal (verde azulado de marca).",
  secondary: "Acción alternativa o neutra: Cancelar, Volver, Ver detalle.",
  info: 'Azul sólido: alta desde el encabezado de una pantalla ("+ Nuevo producto").',
  vivid: "Azul translúcido: acción auxiliar destacada.",
  magenta:
    'Magenta translúcido: crear algo dentro de un formulario ("+ Agregar variantes").',
  success:
    "Verde: confirmar o registrar algo positivo (Crear cliente, Guardar producto).",
  ghost: "Baja jerarquía, sin fondo.",
  danger: "Rojo: acción destructiva o descartar (Cancelar un alta, Eliminar).",
  "ghost-danger": "Destructiva de baja jerarquía: el tacho de una fila.",
  link: "Aspecto de enlace.",
};
const VARIANTS = Object.keys(VARIANT_USAGE) as CharButtonVariant[];

const meta = {
  title: "Char/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    size: { control: "select", options: ["sm", "md", "lg", "icon"] },
  },
  args: { children: "Botón", variant: "primary", size: "md" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Info: Story = {
  args: {
    variant: "info",
    children: (
      <>
        <Plus /> Nuevo producto
      </>
    ),
  },
};
export const Vivid: Story = { args: { variant: "vivid" } };
export const Magenta: Story = {
  args: {
    variant: "magenta",
    children: (
      <>
        <Plus /> Agregar variantes
      </>
    ),
  },
};
export const Success: Story = {
  args: { variant: "success", children: "Crear cliente" },
};
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = {
  args: { variant: "danger", children: "Cancelar" },
};
export const GhostDanger: Story = {
  args: {
    variant: "ghost-danger",
    size: "icon",
    "aria-label": "Eliminar",
    children: <Trash2 />,
  },
};
export const Link: Story = { args: { variant: "link" } };

/**
 * Gama de opacidad del azul de acción (`info`). Cada paso usa el token
 * `--color-info-strong` con el modificador de opacidad de Tailwind, así que
 * cualquier superficie la puede usar sin repetir colores:
 * `bg-info-strong` (100 %), `/85`, `/70`, `/55`.
 */
export const InfoOpacityScale: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-6">
      {(
        [
          ["100 %", "bg-info-strong!"],
          ["85 %", "bg-info-strong/85!"],
          ["70 %", "bg-info-strong/70!"],
          ["55 %", "bg-info-strong/55!"],
        ] as const
      ).map(([label, utility]) => (
        <div key={label} className="flex flex-col items-start gap-2">
          <Button
            {...args}
            variant="ghost"
            className={`${utility} text-info-foreground!`}
          >
            <Plus /> Nuevo producto
          </Button>
          <span className="text-xs text-muted-foreground">
            {label} · <code>{utility.replace("!", "")}</code>
          </span>
        </div>
      ))}
    </div>
  ),
};

/**
 * Gama de opacidad de cada color de botón. Todos salen de un token del tema
 * (`--color-primary`, `-success`, `-danger`, `-magenta`, `-warning` y
 * `-info-strong`) con el modificador de opacidad de Tailwind, así que no hay
 * que definir cada paso: `bg-success/85`, `bg-danger/70`, etc. La primera
 * columna es la variante real del botón, para comparar con la gama.
 */
const COLOR_SCALES: {
  name: string;
  variant: CharButtonVariant;
  token: string;
  /** Clases completas (Tailwind no detecta nombres armados por interpolación). */
  classes: string[];
  text: string;
  note: string;
}[] = [
  {
    name: "Azul de acción",
    variant: "info",
    token: "info-strong",
    classes: [
      "bg-info-strong!",
      "bg-info-strong/85!",
      "bg-info-strong/70!",
      "bg-info-strong/55!",
    ],
    text: "text-info-foreground!",
    note: "variante `info`: 100 %",
  },
  {
    name: "Verde azulado (marca)",
    variant: "primary",
    token: "primary",
    classes: [
      "bg-primary!",
      "bg-primary/85!",
      "bg-primary/70!",
      "bg-primary/55!",
    ],
    text: "text-primary-foreground!",
    note: "variante `primary`: 100 %",
  },
  {
    name: "Verde",
    variant: "success",
    token: "success",
    classes: [
      "bg-success!",
      "bg-success/85!",
      "bg-success/70!",
      "bg-success/55!",
    ],
    text: "text-success-foreground!",
    note: "variante `success`: 70 % (hover 85 %)",
  },
  {
    name: "Rojo",
    variant: "danger",
    token: "danger",
    classes: ["bg-danger!", "bg-danger/85!", "bg-danger/70!", "bg-danger/55!"],
    text: "text-danger-foreground!",
    note: "variante `danger`: 70 % (hover 85 %)",
  },
  {
    name: "Magenta",
    variant: "magenta",
    token: "magenta",
    classes: [
      "bg-magenta!",
      "bg-magenta/85!",
      "bg-magenta/70!",
      "bg-magenta/55!",
    ],
    text: "text-white!",
    note: "variante `magenta`: translúcida 15 %",
  },
  {
    name: "Ámbar",
    variant: "ghost",
    token: "warning",
    classes: [
      "bg-warning!",
      "bg-warning/85!",
      "bg-warning/70!",
      "bg-warning/55!",
    ],
    text: "text-warning-foreground!",
    note: "sin variante de botón (se usa en chips y avisos)",
  },
];
const SCALE_LABELS = ["100 %", "85 %", "70 %", "55 %"] as const;

/**
 * Gama de opacidad (100 / 85 / 70 / 55 %) de todos los colores de botón, con
 * la variante real de cada uno al lado y la clase que produce cada paso.
 */
export const ColorScales: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex max-w-5xl flex-col gap-8">
      {COLOR_SCALES.map(({ name, variant, token, classes, text, note }) => (
        <section key={name} className="flex flex-col gap-3">
          <div>
            <h3 className="text-base font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">
              Token <code>{token}</code> · {note}
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            {variant === "ghost" ? null : (
              <div className="flex flex-col items-start gap-2">
                <Button {...args} variant={variant}>
                  <Plus /> Variante real
                </Button>
                <span className="text-xs text-muted-foreground">
                  {`variant="${variant}"`}
                </span>
              </div>
            )}
            {classes.map((utility, i) => (
              <div key={utility} className="flex flex-col items-start gap-2">
                <Button
                  {...args}
                  variant="ghost"
                  className={`${utility} ${text}`}
                >
                  <Plus /> {SCALE_LABELS[i]}
                </Button>
                <code className="text-xs text-muted-foreground">
                  {utility.replace("!", "")}
                </code>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

/** Las diez variantes juntas, con su uso. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="contents">
          <Button
            {...args}
            variant={variant}
            size={variant === "ghost-danger" ? "icon" : args.size}
            aria-label={variant === "ghost-danger" ? "Eliminar" : undefined}
          >
            {variant === "ghost-danger" ? <Trash2 /> : variant}
          </Button>
          <span className="text-sm text-muted-foreground">
            {VARIANT_USAGE[variant]}
          </span>
        </div>
      ))}
    </div>
  ),
};

/** Cada variante deshabilitada. */
export const AllVariantsDisabled: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {VARIANTS.map((variant) => (
        <Button
          key={variant}
          {...args}
          variant={variant}
          size={variant === "ghost-danger" ? "icon" : args.size}
          aria-label={variant === "ghost-danger" ? "Eliminar" : undefined}
          disabled
        >
          {variant === "ghost-danger" ? <Trash2 /> : variant}
        </Button>
      ))}
    </div>
  ),
};

/** Cada variante en cada tamaño. */
export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          {VARIANTS.filter((v) => v !== "ghost-danger").map((variant) => (
            <Button key={variant} {...args} variant={variant} size={size}>
              {variant}
            </Button>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            {...args}
            variant={variant}
            size="icon"
            aria-label={variant}
          >
            <Plus />
          </Button>
        ))}
      </div>
    </div>
  ),
};

/** Con ícono inicial, como en los encabezados de pantalla. */
export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="info">
        <Plus /> Nuevo cliente
      </Button>
      <Button {...args} variant="danger">
        Cancelar
      </Button>
      <Button {...args} variant="success">
        Guardar
      </Button>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };
