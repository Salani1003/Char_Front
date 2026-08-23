import { readNamedCssTokens } from "../lib/cssTokens";
import { DocSection } from "../components/DocSection";
const RADIUS_NAMES = [
  "--radius-xs",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--radius-2xl",
  "--radius-pill",
  "--radius-round",
  "--radius-card",
  "--radius-card-auth",
  "--radius-input",
  "--radius-input-auth",
  "--radius-control",
  "--radius-nav-item",
  "--radius-badge",
  "--radius-avatar",
];
/**
 * Documenta la escala de radios (`--radius-*`) definida en
 * `src/styles/tokens.css` (escala base) y `src/index.css` (roles: card,
 * input, control, etc.), leída en vivo.
 */
export function RadiusSection() {
  const radii = readNamedCssTokens(RADIUS_NAMES);
  return (
    <DocSection
      id="radius"
      title="Radius"
      description="Escala base y roles semánticos (card, input, control, badge, ...), leídos en vivo."
    >
      <div className="flex flex-wrap gap-5">
        {radii.map((token) => (
          <div key={token.name} className="flex flex-col items-center gap-2">
            <div
              className="size-16 border-2 border-primary bg-accent"
              style={{ borderRadius: `var(${token.name})` }}
            />
            <div className="flex flex-col items-center text-center">
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
    </DocSection>
  );
}
