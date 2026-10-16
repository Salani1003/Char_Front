import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/char/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/char/tooltip";

/**
 * Acción de `PageHeader` que se muestra solo como ícono (por ejemplo un lápiz
 * para editar una ficha). Es un `Button` `size="icon"` con tooltip; el `label`
 * se usa como nombre accesible y como texto del tooltip, así que es
 * obligatorio. Se pasa dentro de la prop `actions` de `PageHeader`.
 *
 * @param icon Ícono a mostrar (ej. `<Pencil />`).
 * @param label Descripción de la acción ("Editar usuario").
 * @param variant Rol visual del botón; por defecto `secondary`.
 */
export function PageHeaderAction({
  icon,
  label,
  variant = "secondary",
  ...props
}: Omit<ComponentProps<typeof Button>, "size" | "children" | "aria-label"> & {
  icon: ReactNode;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        delay={200}
        render={
          <Button
            data-slot="page-header-action"
            size="icon"
            variant={variant}
            aria-label={label}
            {...props}
          >
            {icon}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
