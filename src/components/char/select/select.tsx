/**
 * Re-exporta el primitivo `Select` (y sus subcomponentes) de
 * `components/ui/select` bajo el namespace de Char, para que las pantallas
 * no se acoplen directamente al primitivo. `SelectTrigger` ya expone
 * `size="sm" | "default"` desde `components/ui` — no se duplica acá.
 */
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
