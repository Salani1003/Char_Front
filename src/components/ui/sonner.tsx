import { Toaster as Sonner, type ToasterProps } from "sonner";
/**
 * Wrapper shadcn/base-ui sobre `sonner`. Aplica los tokens de color de Char
 * (`--popover`, `--border`, etc.) a las notificaciones vía CSS variables, y
 * tiñe `success`, `warning`, `error` e `info` con sus tokens de rol
 * (`--success`, `--warning`, `--danger`, `--info`).
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
          "--success-bg":
            "color-mix(in oklch, var(--success) 10%, var(--popover))",
          "--success-text": "var(--success)",
          "--success-border": "var(--success)",
          "--warning-bg":
            "color-mix(in oklch, var(--warning) 10%, var(--popover))",
          "--warning-text": "var(--warning)",
          "--warning-border": "var(--warning)",
          "--error-bg":
            "color-mix(in oklch, var(--danger) 10%, var(--popover))",
          "--error-text": "var(--danger)",
          "--error-border": "var(--danger)",
          "--info-bg": "color-mix(in oklch, var(--info) 10%, var(--popover))",
          "--info-text": "var(--info)",
          "--info-border": "var(--info)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};
export { Toaster };
