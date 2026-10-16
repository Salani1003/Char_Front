import type { ReactNode } from "react";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/char/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ActionsMenuItem {
  label: string;
  /** Ícono mostrado antes de la etiqueta. */
  icon?: ReactNode;
  /** Se llama al elegir la opción; el menú se cierra solo. */
  onSelect: () => void;
  /** `danger` para acciones destructivas (ej. eliminar). */
  variant?: "default" | "danger";
}

/**
 * Menú de acciones de Char: un botón de tres puntitos que despliega una lista
 * de opciones (editar, eliminar, ...). Pensado para tarjetas y filas de
 * listados. Se navega con teclado (flechas, Enter, Escape).
 *
 * @param label Nombre accesible del botón (ej. "Acciones de María Pérez").
 * @param items Opciones del menú: `label`, `icon`, `onSelect` y `variant`.
 */
export function ActionsMenu({
  label,
  items,
}: {
  label: string;
  items: ActionsMenuItem[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            className="text-muted-foreground"
          />
        }
      >
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map(({ label: itemLabel, icon, onSelect, variant }) => (
          <DropdownMenuItem
            key={itemLabel}
            onClick={onSelect}
            className={cn(variant === "danger" && "text-danger")}
          >
            {icon}
            {itemLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
