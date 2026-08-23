import { useState } from "react";
import { readNamedCssTokens } from "../lib/cssTokens";
import { DocSection, DocSubheading } from "../components/DocSection";
const DURATION_NAMES = [
  "--duration-fast",
  "--duration-base",
  "--duration-slow",
  "--duration-slower",
  "--duration-slowest",
];
const EASE_NAMES = ["--ease-standard"];
/**
 * Pista con un punto que se desplaza al pasar el mouse, usando la duración
 * real del token (`var(--duration-x)`) para poder comparar velocidades.
 */
function DurationTrack({ name, value }: { name: string; value: string }) {
  const [active, setActive] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <div className="flex w-40 shrink-0 flex-col gap-0.5">
        <code className="text-xs font-medium text-foreground">{name}</code>
        <span className="text-xs text-muted-foreground">{value || "—"}</span>
      </div>
      <div
        className="relative h-8 flex-1 rounded-pill bg-muted"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
      >
        <div
          className="absolute top-1/2 size-6 -translate-y-1/2 rounded-round bg-primary"
          style={{
            left: active ? "calc(100% - 1.5rem)" : 0,
            transitionProperty: "left",
            transitionDuration: `var(${name})`,
            transitionTimingFunction: "var(--ease-standard)",
          }}
        />
      </div>
    </div>
  );
}
/**
 * Documenta las duraciones (`--duration-*`) y el easing (`--ease-*`) de
 * `src/styles/tokens.css`. Pasar el mouse sobre cada pista mueve el punto
 * usando la duración real del token, para comparar velocidades entre ellas.
 */
export function MotionSection() {
  const durations = readNamedCssTokens(DURATION_NAMES);
  const eases = readNamedCssTokens(EASE_NAMES);
  return (
    <DocSection
      id="motion"
      title="Motion"
      description="Pasá el mouse sobre cada pista para comparar la duración real de cada token."
    >
      <div className="flex flex-col gap-3">
        <DocSubheading>Durations</DocSubheading>
        <div className="flex flex-col gap-4">
          {durations.map((token) => (
            <DurationTrack
              key={token.name}
              name={token.name}
              value={token.value}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Easing</DocSubheading>
        <div className="flex flex-wrap gap-6">
          {eases.map((token) => (
            <div key={token.name} className="flex flex-col gap-1">
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
