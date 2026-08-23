/**
 * Re-exporta el primitivo `Card` de `components/ui/card` bajo el namespace
 * de Char. Hoy no agrega comportamiento propio, pero las pantallas deben
 * importar `Card` desde acá (no desde `components/ui`) para no acoplarse
 * directamente al primitivo — si el Design System de Char necesita una
 * variante o API propia para tarjetas, se agrega en este archivo sin tocar
 * las pantallas que ya lo consumen.
 */
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
