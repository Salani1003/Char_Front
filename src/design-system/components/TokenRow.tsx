import type { ReactNode } from "react";
import type { CssToken } from "../lib/cssTokens";
/**
 * Fila que muestra el nombre y valor computado de un token junto a una
 * representación visual arbitraria (barra de spacing, muestra de radio,
 * sombra, etc.), pasada como `children`.
 */
export function TokenRow({
  token,
  children,
}: {
  token: CssToken;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border/60 py-2.5 last:border-b-0">
      <div className="flex w-52 shrink-0 flex-col gap-0.5">
        <code className="text-xs font-medium text-foreground">
          {token.name}
        </code>
        <span className="text-xs text-muted-foreground">
          {token.value || "—"}
        </span>
      </div>
      <div className="flex flex-1 items-center">{children}</div>
    </div>
  );
}
