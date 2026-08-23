import { Toaster as Sonner, type ToasterProps } from "sonner";
/**
 * Wrapper shadcn/base-ui sobre `sonner`. Aplica los tokens de color de Char
 * (`--popover`, `--border`, etc.) a las notificaciones vía CSS variables.
 * No usar directamente en pantallas: importar `@/components/char/sonner`.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};
export { Toaster };
