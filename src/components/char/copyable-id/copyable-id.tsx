import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "@/components/char/sonner";
import { cn } from "@/lib/utils";

/**
 * Id (o cualquier código corto) de Char que se copia al portapapeles con un
 * clic. Muestra el valor en tipografía monoespaciada y cambia el ícono a un
 * check durante 1,5 s; si el navegador no deja copiar, avisa con un toast de
 * error. Detiene la propagación del clic, así que se puede usar dentro de una
 * fila clickeable.
 *
 * @param value Texto que se muestra y se copia.
 * @param label Nombre accesible del botón; por defecto "Copiar {value}".
 */
export function CopyableId({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("No pudimos copiar. Copialo a mano.");
    }
  };

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        void copy();
      }}
      aria-label={label ?? `Copiar ${value}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 font-mono text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {value}
      {copied ? (
        <Check className="size-3.5 text-success" aria-hidden />
      ) : (
        <Copy className="size-3.5 text-muted-foreground" aria-hidden />
      )}
    </button>
  );
}
