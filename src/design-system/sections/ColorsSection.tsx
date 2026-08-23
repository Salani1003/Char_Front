import { readCssTokens, readNamedCssTokens } from "../lib/cssTokens";
import { DocSection, DocSubheading } from "../components/DocSection";
import { TokenSwatch } from "../components/TokenSwatch";
const SEMANTIC_PAIRS: Array<[name: string, foreground?: string]> = [
  ["--background", "--foreground"],
  ["--surface", "--foreground"],
  ["--card", "--card-foreground"],
  ["--popover", "--popover-foreground"],
  ["--primary", "--primary-foreground"],
  ["--secondary", "--secondary-foreground"],
  ["--accent", "--accent-foreground"],
  ["--muted", "--muted-foreground"],
  ["--success", "--success-foreground"],
  ["--warning", "--warning-foreground"],
  ["--danger", "--danger-foreground"],
  ["--destructive", "--destructive-foreground"],
  ["--border"],
  ["--input"],
  ["--ring"],
];
const SIDEBAR_PAIRS: Array<[name: string, foreground?: string]> = [
  ["--sidebar", "--sidebar-foreground"],
  ["--sidebar-primary", "--sidebar-primary-foreground"],
  ["--sidebar-accent", "--sidebar-accent-foreground"],
  ["--sidebar-border"],
  ["--sidebar-ring"],
];
const SEMANTIC_NAMES = [...SEMANTIC_PAIRS, ...SIDEBAR_PAIRS].flatMap(
  ([name, fg]) => (fg ? [name, fg] : [name]),
);
/**
 * Documenta la paleta raw (`--char-*`) y los tokens semánticos (`--primary`,
 * `--background`, etc.) de `src/styles/tokens.css` / `src/index.css`. Lee
 * los valores en vivo vía `useCssTokens`/`useNamedCssTokens` — no hardcodea
 * ningún color.
 */
export function ColorsSection() {
  const cream = readCssTokens("--char-cream-");
  const slate = readCssTokens("--char-slate-");
  const accent = readCssTokens("--char-accent");
  const gold = readCssTokens("--char-brand-gold");
  const success = readCssTokens("--char-success");
  const warning = readCssTokens("--char-warning");
  const danger = readCssTokens("--char-danger");
  const info = readCssTokens("--char-info");
  const semantic = readNamedCssTokens(SEMANTIC_NAMES);
  const semanticByName = new Map(semantic.map((t) => [t.name, t]));
  const rawGroups: Array<{ title: string; tokens: typeof cream }> = [
    { title: "Cream", tokens: cream },
    { title: "Slate", tokens: slate },
    { title: "Accent", tokens: accent },
    { title: "Gold", tokens: gold },
    { title: "Success", tokens: success },
    { title: "Warning", tokens: warning },
    { title: "Danger", tokens: danger },
    { title: "Info", tokens: info },
  ];
  return (
    <DocSection
      id="colors"
      title="Colors"
      description="Paleta raw (--char-*) y tokens semánticos, leídos en vivo desde src/styles/tokens.css y src/index.css."
    >
      <div className="flex flex-col gap-6">
        <DocSubheading>Raw palette</DocSubheading>
        <div className="flex flex-col gap-6">
          {rawGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                {group.title}
              </p>
              <div className="flex flex-wrap gap-3">
                {group.tokens.map((token) => (
                  <TokenSwatch key={token.name} token={token} />
                ))}
                {group.tokens.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Sin tokens para este grupo.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Semantic tokens</DocSubheading>
        <div className="flex flex-wrap gap-3">
          {SEMANTIC_PAIRS.map(([name, fg]) => {
            const token = semanticByName.get(name);
            if (!token) return null;
            return (
              <TokenSwatch key={name} token={token} foregroundToken={fg} />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <DocSubheading>Sidebar</DocSubheading>
        <div className="flex flex-wrap gap-3">
          {SIDEBAR_PAIRS.map(([name, fg]) => {
            const token = semanticByName.get(name);
            if (!token) return null;
            return (
              <TokenSwatch key={name} token={token} foregroundToken={fg} />
            );
          })}
        </div>
      </div>
    </DocSection>
  );
}
