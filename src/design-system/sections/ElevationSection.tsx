import { readNamedCssTokens } from "../lib/cssTokens";
import { DocSection } from "../components/DocSection";
const SHADOW_NAMES = [
  "--shadow-dropdown",
  "--shadow-drawer",
  "--shadow-nav-mobile",
];
/**
 * Documenta las sombras (`--shadow-*`) definidas en `src/styles/tokens.css`,
 * leídas en vivo y aplicadas sobre una tarjeta flotante para poder comparar
 * la diferencia de elevación entre ellas.
 */
export function ElevationSection() {
  const shadows = readNamedCssTokens(SHADOW_NAMES);
  return (
    <DocSection
      id="elevation"
      title="Elevation"
      description="Char es un sistema de baja elevación: los bordes hacen el trabajo y las sombras solo aparecen en elementos que flotan sobre la página (dropdowns, drawers, nav mobile)."
    >
      <div className="flex flex-wrap gap-8 rounded-card bg-muted p-8">
        {shadows.map((token) => (
          <div key={token.name} className="flex flex-col items-center gap-3">
            <div
              className="flex size-24 items-center justify-center rounded-card bg-card text-xs text-muted-foreground"
              style={{ boxShadow: `var(${token.name})` }}
            >
              Char
            </div>
            <div className="flex flex-col items-center text-center">
              <code className="text-xs font-medium text-foreground">
                {token.name}
              </code>
              <span className="max-w-40 truncate text-xs text-muted-foreground">
                {token.value || "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DocSection>
  );
}
