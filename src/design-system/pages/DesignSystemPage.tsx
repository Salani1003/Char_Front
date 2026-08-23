import { ColorsSection } from "../sections/ColorsSection";
import { ComponentsSection } from "../sections/ComponentsSection";
import { ElevationSection } from "../sections/ElevationSection";
import { MotionSection } from "../sections/MotionSection";
import { RadiusSection } from "../sections/RadiusSection";
import { SpacingSection } from "../sections/SpacingSection";
import { TypographySection } from "../sections/TypographySection";
const NAV_ITEMS = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "radius", label: "Radius" },
  { id: "elevation", label: "Elevation" },
  { id: "motion", label: "Motion" },
  { id: "components", label: "Components" },
];
/**
 * Catálogo visual e interactivo del Design System de Char: documenta todos
 * los tokens de `src/styles/tokens.css`/`src/index.css` y los componentes
 * reutilizables de `src/components/char`, leyendo los valores reales en
 * vivo (no hardcodeados) para servir de referencia durante el desarrollo.
 * Ruta: `/design-system`. Es una herramienta de desarrollo, no una pantalla
 * de la aplicación comercial.
 */
export function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="font-display text-xl font-semibold text-foreground">
              Char Design System
            </p>
            <p className="text-xs text-muted-foreground">
              Documentación viva de tokens y componentes — src/styles/tokens.css
            </p>
          </div>
          <nav
            aria-label="Secciones del Design System"
            className="-mx-1 flex gap-1 overflow-x-auto px-1"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="shrink-0 rounded-control px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <ColorsSection />
        <TypographySection />
        <SpacingSection />
        <RadiusSection />
        <ElevationSection />
        <MotionSection />
        <ComponentsSection />
      </main>
    </div>
  );
}
export default DesignSystemPage;
