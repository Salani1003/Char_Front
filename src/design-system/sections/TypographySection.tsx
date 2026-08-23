import { readNamedCssTokens } from "../lib/cssTokens";
import { DocSection, DocSubheading } from "../components/DocSection";
const FAMILY_NAMES = [
  "--font-sans",
  "--font-display",
  "--font-heading",
  "--font-montserrat",
];
const SIZE_SUFFIXES = [
  "2xs",
  "xs",
  "xs-plus",
  "sm",
  "sm-plus",
  "base",
  "base-plus",
  "md",
  "md-plus",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "7xl",
];
const SIZE_NAMES = SIZE_SUFFIXES.map((s) => `--char-text-${s}`);
const WEIGHT_NAMES = [
  "--weight-regular",
  "--weight-medium",
  "--weight-semibold",
  "--weight-bold",
];
const LEADING_NAMES = [
  "--char-leading-tight",
  "--char-leading-snug",
  "--char-leading-normal",
  "--char-leading-relaxed",
];
const TRACKING_NAMES = [
  "--tracking-eyebrow",
  "--tracking-nav-group",
  "--tracking-brand",
];
const SAMPLE_LINES =
  "Clientes, proveedores, productos, ventas y stock de Char en un solo lugar.";
/**
 * Documenta las familias tipográficas, tamaños, pesos, line-heights y
 * letter-spacing definidos en `src/styles/tokens.css` / `src/index.css`.
 * Cada muestra se renderiza aplicando el token real vía `var(--token)`.
 */
export function TypographySection() {
  const families = readNamedCssTokens(FAMILY_NAMES);
  const sizes = readNamedCssTokens(SIZE_NAMES);
  const weights = readNamedCssTokens(WEIGHT_NAMES);
  const leadings = readNamedCssTokens(LEADING_NAMES);
  const trackings = readNamedCssTokens(TRACKING_NAMES);
  return (
    <DocSection
      id="typography"
      title="Typography"
      description="Familias, tamaños, pesos, line-height y letter-spacing, aplicados en vivo sobre texto de ejemplo."
    >
      <div className="flex flex-col gap-3">
        <DocSubheading>Families</DocSubheading>
        <div className="flex flex-col gap-4">
          {families.map((token) => (
            <div key={token.name} className="flex flex-col gap-1">
              <p
                className="text-2xl text-foreground"
                style={{ fontFamily: `var(${token.name})` }}
              >
                Char Tienda — Gestión comercial
              </p>
              <div className="flex flex-wrap items-baseline gap-2">
                <code className="text-xs font-medium text-foreground">
                  {token.name}
                </code>
                <span className="text-xs text-muted-foreground">
                  {token.value || "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Sizes</DocSubheading>
        <div className="flex flex-col">
          {sizes.map((token) => (
            <div
              key={token.name}
              className="flex flex-wrap items-baseline gap-4 border-b border-border/60 py-2 last:border-b-0"
            >
              <div className="flex w-40 shrink-0 flex-col gap-0.5">
                <code className="text-xs font-medium text-foreground">
                  {token.name}
                </code>
                <span className="text-xs text-muted-foreground">
                  {token.value || "—"}
                </span>
              </div>
              <p
                className="min-w-0 truncate text-foreground"
                style={{ fontSize: `var(${token.name})` }}
              >
                Char Tienda
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Weights</DocSubheading>
        <div className="flex flex-wrap gap-6">
          {weights.map((token) => (
            <div key={token.name} className="flex flex-col gap-1">
              <p
                className="text-lg text-foreground"
                style={{ fontWeight: `var(${token.name})` }}
              >
                Char Tienda
              </p>
              <code className="text-xs font-medium text-foreground">
                {token.name}
              </code>
              <span className="text-xs text-muted-foreground">
                {token.value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Line height</DocSubheading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {leadings.map((token) => (
            <div
              key={token.name}
              className="rounded-card border border-border bg-card p-4"
            >
              <p
                className="mb-2 max-w-sm text-sm text-foreground"
                style={{ lineHeight: `var(${token.name})` }}
              >
                {SAMPLE_LINES}
              </p>
              <code className="text-xs font-medium text-foreground">
                {token.name}
              </code>{" "}
              <span className="text-xs text-muted-foreground">
                {token.value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Letter spacing</DocSubheading>
        <div className="flex flex-wrap gap-6">
          {trackings.map((token) => (
            <div key={token.name} className="flex flex-col gap-1">
              <p
                className="text-xs font-semibold text-foreground uppercase"
                style={{ letterSpacing: `var(${token.name})` }}
              >
                Gestión comercial
              </p>
              <code className="text-xs font-medium text-foreground">
                {token.name}
              </code>
              <span className="text-xs text-muted-foreground">
                {token.value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DocSection>
  );
}
