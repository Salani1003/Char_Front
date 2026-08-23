import { readCssTokens, readNamedCssTokens } from "../lib/cssTokens";
import { DocSection, DocSubheading } from "../components/DocSection";
import { TokenRow } from "../components/TokenRow";
function bySpaceNumber(a: { name: string }, b: { name: string }) {
  const na = Number(a.name.replace("--space-", ""));
  const nb = Number(b.name.replace("--space-", ""));
  return na - nb;
}
const LAYOUT_METRIC_NAMES = [
  "--gutter-mobile",
  "--gutter-tablet",
  "--gutter-desktop",
  "--pad-card",
  "--pad-card-tight",
  "--pad-table-cell-y",
  "--pad-table-cell-y-compact",
  "--pad-table-cell-x",
  "--pad-control-y",
  "--pad-control-x",
  "--control-height",
  "--control-height-lg",
  "--control-height-auth",
  "--icon-button-size",
  "--touch-target",
  "--sidebar-width",
  "--sidebar-width-rail",
  "--sidebar-width-mobile",
  "--header-height",
  "--header-height-mobile",
  "--drawer-width",
  "--table-min-width",
];
/**
 * Documenta la escala de spacing (`--space-*`) y las métricas de layout
 * (gutters, paddings de componentes, alturas de control, etc.) definidas en
 * `src/styles/tokens.css`. Cada valor se lee en vivo y se representa con un
 * bloque cuyo tamaño real corresponde al token.
 */
export function SpacingSection() {
  const space = readCssTokens("--space-").sort(bySpaceNumber);
  const metrics = readNamedCssTokens(LAYOUT_METRIC_NAMES);
  return (
    <DocSection
      id="spacing"
      title="Spacing"
      description="Escala de espaciado y métricas de layout/componentes, leídas en vivo desde src/styles/tokens.css."
    >
      <div className="flex flex-col gap-3">
        <DocSubheading>Scale</DocSubheading>
        <div className="flex flex-col">
          {space.map((token) => (
            <TokenRow key={token.name} token={token}>
              <div
                className="h-3 rounded-xs bg-primary"
                style={{ width: `var(${token.name})` }}
              />
            </TokenRow>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Layout &amp; component metrics</DocSubheading>
        <div className="flex flex-col">
          {metrics.map((token) => (
            <TokenRow key={token.name} token={token}>
              <div
                className="h-3 max-w-full rounded-xs bg-secondary"
                style={{ width: `min(var(${token.name}), 100%)` }}
              />
            </TokenRow>
          ))}
        </div>
      </div>
    </DocSection>
  );
}
