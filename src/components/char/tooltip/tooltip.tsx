/**
 * Re-exporta el primitivo `Tooltip` (y sus subcomponentes) de
 * `components/ui/tooltip` bajo el namespace de Char, para que las pantallas
 * no se acoplen directamente al primitivo. No necesita variantes propias:
 * la identidad visual (color, radio, sombra) ya viene de los tokens del
 * Design System aplicados en `components/ui/tooltip`.
 */
export {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
