import type { CssToken } from "../lib/cssTokens";
/**
 * Tarjeta que muestra una muestra visual de color junto al nombre del
 * token y su valor computado. El color se aplica vía `var(--token)`
 * directamente (nunca el valor hardcodeado) para que siempre refleje el
 * token real definido en `src/styles/tokens.css` / `src/index.css`.
 *
 * @param token Nombre y valor computado (leído en vivo) del token.
 * @param foregroundToken Nombre de un token de color de texto a mostrar
 * sobre la muestra (para pares fondo/texto, ej. `primary`/`primary-foreground`).
 */
export function TokenSwatch({
  token,
  foregroundToken,
}: {
  token: CssToken;
  foregroundToken?: string;
}) {
  return (
    <div className="flex w-36 flex-col overflow-hidden rounded-card border border-border bg-card">
      <div
        className="flex h-16 items-center justify-center text-xs font-medium"
        style={{
          background: `var(${token.name})`,
          color: foregroundToken ? `var(${foregroundToken})` : undefined,
        }}
      >
        {foregroundToken ? "Aa" : null}
      </div>
      <div className="flex flex-col gap-0.5 px-2.5 py-2">
        <code className="truncate text-xs font-medium text-foreground">
          {token.name}
        </code>
        <span className="truncate text-xs text-muted-foreground">
          {token.value || "—"}
        </span>
      </div>
    </div>
  );
}
