/**
 * Re-exporta el primitivo `Skeleton` de `components/ui/skeleton` bajo el
 * namespace de Char: un bloque gris pulsante (oculto para lectores de
 * pantalla) que se dimensiona con `className` (`h-*`, `w-*`, `rounded-*`) y
 * representa contenido que todavía está cargando. Para armar el esqueleto de
 * una pantalla se compone con varios; el contenedor debe llevar
 * `role="status"` y un texto `sr-only` ("Cargando…").
 */
export { Skeleton } from "@/components/ui/skeleton";
