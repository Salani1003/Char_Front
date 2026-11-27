import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { Button } from "./button";

/**
 * Paleta de colores de botón para **comparar y decidir**: por cada color
 * (azul, rojo, verde, magenta y dorado) una fila de "Sólidos" (más o menos
 * oscuros y con degradé) y una de "Opacidad" (100 a 55 %, translúcido y tonal).
 *
 * No son variantes del componente: cada muestra es un botón neutro (`ghost`)
 * con clases de utilidad encima que usan solo tokens del tema (`info`,
 * `danger`, `success`, `magenta`, `--char-brand-gold`, `primary`). Tailwind solo
 * genera clases escritas **completas** en el archivo, por eso cada muestra
 * tiene su cadena literal. Lo que se elija pasa después a una variante real en
 * `components/ui/button.tsx` (y al mapa de `components/char/button`).
 */
const meta = {
  title: "Char/Button/Paleta de colores",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

interface Proposal {
  name: string;
  /** Clases de utilidad (con `!` para ganarle al estilo base del `ghost`). */
  className: string;
}

/** Botón de muestra con su nombre debajo. */
function Sample({ name, className }: Proposal) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="ghost" className={className}>
        <Plus /> Nuevo producto
      </Button>
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  );
}

function Section({ title, items }: { title: string; items: Proposal[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-x-6 gap-y-5">
        {items.map((item) => (
          <Sample key={item.name} {...item} />
        ))}
      </div>
    </section>
  );
}

/** Un color: su fila de sólidos y su fila de opacidad. */
function ColorBlock({
  name,
  solids,
  opacity,
}: {
  name: string;
  solids: Proposal[];
  opacity: Proposal[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-xl font-semibold">{name}</h2>
      <Section title="Sólidos" items={solids} />
      <Section title="Opacidad" items={opacity} />
    </div>
  );
}

const SHADOW =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(43,49,56,0.3)]!";

const SOLIDOS_AZUL: Proposal[] = [
  {
    name: "Oscuro translúcido (azul −25 % negro, 85 %)",
    className: `border-info/50! bg-[color-mix(in_oklab,color-mix(in_oklch,var(--color-info),black_25%)_85%,transparent)]! text-info-foreground! ${SHADOW} hover:bg-[color-mix(in_oklab,color-mix(in_oklch,var(--color-info),black_38%)_92%,transparent)]!`,
  },
  {
    name: "Azul de marca 100 %",
    className: `bg-info! text-info-foreground! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-info),black_12%)]!`,
  },
  {
    name: "Azul −15 % negro, opaco",
    className: `bg-[color-mix(in_oklch,var(--color-info),black_15%)]! text-info-foreground! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-info),black_28%)]!`,
  },
  {
    name: "Azul oscuro (−40 % negro)",
    className: `bg-[color-mix(in_oklch,var(--color-info),black_40%)]! text-white! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-info),black_52%)]!`,
  },
  {
    name: "Azul → verde azulado (degradé)",
    className: `bg-linear-to-r from-info to-primary text-info-foreground! ${SHADOW}`,
  },
  {
    name: "Azul oscuro → azul (degradé vertical)",
    className: `bg-linear-to-b from-info to-[color-mix(in_oklch,var(--color-info),black_30%)] text-info-foreground! ${SHADOW}`,
  },
];

const OPACIDAD_AZUL: Proposal[] = [
  { name: "Azul 100 %", className: "bg-info! text-info-foreground!" },
  { name: "Azul 85 %", className: "bg-info/85! text-info-foreground!" },
  { name: "Azul 70 %", className: "bg-info/70! text-info-foreground!" },
  { name: "Azul 55 %", className: "bg-info/55! text-info-foreground!" },
  {
    name: "Translúcido 15 % (estilo vivid)",
    className: "border-info/40! bg-info/15! text-info!",
  },
  {
    name: "Azul 30 % con texto oscuro",
    className: "border-info/40! bg-info/30! text-foreground!",
  },
];

const SOLIDOS_ROJO: Proposal[] = [
  {
    name: "Oscuro translúcido (rojo −25 % negro, 85 %)",
    className: `border-danger/50! bg-[color-mix(in_oklab,color-mix(in_oklch,var(--color-danger),black_25%)_85%,transparent)]! text-danger-foreground! ${SHADOW} hover:bg-[color-mix(in_oklab,color-mix(in_oklch,var(--color-danger),black_38%)_92%,transparent)]!`,
  },
  {
    name: "Rojo de marca 100 %",
    className: `bg-danger! text-danger-foreground! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-danger),black_12%)]!`,
  },
  {
    name: "Rojo −15 % negro, opaco",
    className: `bg-[color-mix(in_oklch,var(--color-danger),black_15%)]! text-danger-foreground! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-danger),black_28%)]!`,
  },
  {
    name: "Rojo oscuro (−40 % negro)",
    className: `bg-[color-mix(in_oklch,var(--color-danger),black_40%)]! text-white! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-danger),black_52%)]!`,
  },
  {
    name: "Rojo → verde azulado (degradé)",
    className: `bg-linear-to-r from-danger to-primary text-danger-foreground! ${SHADOW}`,
  },
  {
    name: "Rojo oscuro → rojo (degradé vertical)",
    className: `bg-linear-to-b from-danger to-[color-mix(in_oklch,var(--color-danger),black_30%)] text-danger-foreground! ${SHADOW}`,
  },
];

const OPACIDAD_ROJO: Proposal[] = [
  { name: "Rojo 100 %", className: "bg-danger! text-danger-foreground!" },
  { name: "Rojo 85 %", className: "bg-danger/85! text-danger-foreground!" },
  { name: "Rojo 70 %", className: "bg-danger/70! text-danger-foreground!" },
  { name: "Rojo 55 %", className: "bg-danger/55! text-danger-foreground!" },
  {
    name: "Translúcido 15 % (estilo vivid)",
    className: "border-danger/40! bg-danger/15! text-danger!",
  },
  {
    name: "Rojo 30 % con texto oscuro",
    className: "border-danger/40! bg-danger/30! text-foreground!",
  },
];

const SOLIDOS_VERDE: Proposal[] = [
  {
    name: "Oscuro translúcido (verde −25 % negro, 85 %)",
    className: `border-success/50! bg-[color-mix(in_oklab,color-mix(in_oklch,var(--color-success),black_25%)_85%,transparent)]! text-success-foreground! ${SHADOW} hover:bg-[color-mix(in_oklab,color-mix(in_oklch,var(--color-success),black_38%)_92%,transparent)]!`,
  },
  {
    name: "Verde de marca 100 %",
    className: `bg-success! text-success-foreground! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-success),black_12%)]!`,
  },
  {
    name: "Verde −15 % negro, opaco",
    className: `bg-[color-mix(in_oklch,var(--color-success),black_15%)]! text-success-foreground! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-success),black_28%)]!`,
  },
  {
    name: "Verde oscuro (−40 % negro)",
    className: `bg-[color-mix(in_oklch,var(--color-success),black_40%)]! text-white! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-success),black_52%)]!`,
  },
  {
    name: "Verde → verde azulado (degradé)",
    className: `bg-linear-to-r from-success to-primary text-success-foreground! ${SHADOW}`,
  },
  {
    name: "Verde oscuro → verde (degradé vertical)",
    className: `bg-linear-to-b from-success to-[color-mix(in_oklch,var(--color-success),black_30%)] text-success-foreground! ${SHADOW}`,
  },
];

const OPACIDAD_VERDE: Proposal[] = [
  { name: "Verde 100 %", className: "bg-success! text-success-foreground!" },
  { name: "Verde 85 %", className: "bg-success/85! text-success-foreground!" },
  { name: "Verde 70 %", className: "bg-success/70! text-success-foreground!" },
  { name: "Verde 55 %", className: "bg-success/55! text-success-foreground!" },
  {
    name: "Translúcido 15 % (estilo vivid)",
    className: "border-success/40! bg-success/15! text-success!",
  },
  {
    name: "Verde 30 % con texto oscuro",
    className: "border-success/40! bg-success/30! text-foreground!",
  },
];

const SOLIDOS_MAGENTA: Proposal[] = [
  {
    name: "Oscuro translúcido (magenta −25 % negro, 85 %)",
    className: `border-magenta/50! bg-[color-mix(in_oklab,color-mix(in_oklch,var(--color-magenta),black_25%)_85%,transparent)]! text-white! ${SHADOW} hover:bg-[color-mix(in_oklab,color-mix(in_oklch,var(--color-magenta),black_38%)_92%,transparent)]!`,
  },
  {
    name: "Magenta de marca 100 %",
    className: `bg-magenta! text-white! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-magenta),black_12%)]!`,
  },
  {
    name: "Magenta −15 % negro, opaco",
    className: `bg-[color-mix(in_oklch,var(--color-magenta),black_15%)]! text-white! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-magenta),black_28%)]!`,
  },
  {
    name: "Magenta oscuro (−40 % negro)",
    className: `bg-[color-mix(in_oklch,var(--color-magenta),black_40%)]! text-white! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--color-magenta),black_52%)]!`,
  },
  {
    name: "Magenta → verde azulado (degradé)",
    className: `bg-linear-to-r from-magenta to-primary text-white! ${SHADOW}`,
  },
  {
    name: "Magenta oscuro → magenta (degradé vertical)",
    className: `bg-linear-to-b from-magenta to-[color-mix(in_oklch,var(--color-magenta),black_30%)] text-white! ${SHADOW}`,
  },
];

const OPACIDAD_MAGENTA: Proposal[] = [
  { name: "Magenta 100 %", className: "bg-magenta! text-white!" },
  { name: "Magenta 85 %", className: "bg-magenta/85! text-white!" },
  { name: "Magenta 70 %", className: "bg-magenta/70! text-white!" },
  { name: "Magenta 55 %", className: "bg-magenta/55! text-white!" },
  {
    name: "Translúcido 15 % (estilo vivid)",
    className: "border-magenta/40! bg-magenta/15! text-magenta!",
  },
  {
    name: "Magenta 30 % con texto oscuro",
    className: "border-magenta/40! bg-magenta/30! text-foreground!",
  },
];

const SOLIDOS_DORADO: Proposal[] = [
  {
    name: "Oscuro translúcido (dorado −25 % negro, 85 %)",
    className: `border-(--char-brand-gold)/50! bg-[color-mix(in_oklab,color-mix(in_oklch,var(--char-brand-gold),black_25%)_85%,transparent)]! text-foreground! ${SHADOW} hover:bg-[color-mix(in_oklab,color-mix(in_oklch,var(--char-brand-gold),black_38%)_92%,transparent)]!`,
  },
  {
    name: "Dorado de marca 100 %",
    className: `bg-(--char-brand-gold)! text-foreground! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--char-brand-gold),black_12%)]!`,
  },
  {
    name: "Dorado −15 % negro, opaco",
    className: `bg-[color-mix(in_oklch,var(--char-brand-gold),black_15%)]! text-foreground! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--char-brand-gold),black_28%)]!`,
  },
  {
    name: "Dorado oscuro (−40 % negro)",
    className: `bg-[color-mix(in_oklch,var(--char-brand-gold),black_40%)]! text-white! ${SHADOW} hover:bg-[color-mix(in_oklch,var(--char-brand-gold),black_52%)]!`,
  },
  {
    name: "Dorado → verde azulado (degradé)",
    className: `bg-linear-to-r from-(--char-brand-gold) to-primary text-foreground! ${SHADOW}`,
  },
  {
    name: "Dorado oscuro → dorado (degradé vertical)",
    className: `bg-linear-to-b from-(--char-brand-gold) to-[color-mix(in_oklch,var(--char-brand-gold),black_30%)] text-foreground! ${SHADOW}`,
  },
];

const OPACIDAD_DORADO: Proposal[] = [
  {
    name: "Dorado 100 %",
    className: "bg-(--char-brand-gold)! text-foreground!",
  },
  {
    name: "Dorado 85 %",
    className: "bg-(--char-brand-gold)/85! text-foreground!",
  },
  {
    name: "Dorado 70 %",
    className: "bg-(--char-brand-gold)/70! text-foreground!",
  },
  {
    name: "Dorado 55 %",
    className: "bg-(--char-brand-gold)/55! text-foreground!",
  },
  {
    name: "Translúcido 15 % (estilo vivid)",
    className:
      "border-(--char-brand-gold)/40! bg-(--char-brand-gold)/15! text-foreground!",
  },
  {
    name: "Dorado 30 % con texto oscuro",
    className:
      "border-(--char-brand-gold)/40! bg-(--char-brand-gold)/30! text-foreground!",
  },
];

const COLORES = [
  { name: "Azul", solids: SOLIDOS_AZUL, opacity: OPACIDAD_AZUL },
  { name: "Rojo", solids: SOLIDOS_ROJO, opacity: OPACIDAD_ROJO },
  { name: "Verde", solids: SOLIDOS_VERDE, opacity: OPACIDAD_VERDE },
  { name: "Magenta", solids: SOLIDOS_MAGENTA, opacity: OPACIDAD_MAGENTA },
  { name: "Dorado", solids: SOLIDOS_DORADO, opacity: OPACIDAD_DORADO },
] satisfies { name: string; solids: Proposal[]; opacity: Proposal[] }[];

/** Los cinco colores, uno debajo del otro. */
export const TodosLosColores: Story = {
  render: () => (
    <div className="flex max-w-6xl flex-col gap-14">
      {COLORES.map((color) => (
        <ColorBlock key={color.name} {...color} />
      ))}
    </div>
  ),
};

const single = (name: string): Story => ({
  render: () => {
    const color = COLORES.find((c) => c.name === name)!;
    return (
      <div className="max-w-6xl">
        <ColorBlock {...color} />
      </div>
    );
  },
});
export const Azul: Story = single("Azul");
export const Rojo: Story = single("Rojo");
export const Verde: Story = single("Verde");
export const Magenta: Story = single("Magenta");
export const Dorado: Story = single("Dorado");
