/**
 * Re-exporta el primitivo `Textarea` de `components/ui/textarea` bajo el
 * namespace de Char, para que las pantallas no se acoplen directamente al
 * primitivo. No agrega comportamiento propio hoy — si el Design System
 * necesita tamaños/identidad propia, se agregan acá.
 */
export { Textarea } from "@/components/ui/textarea";
