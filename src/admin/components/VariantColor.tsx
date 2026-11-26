/**
 * Muestra un color con su muestra circular (`hex`) y su nombre. La muestra es
 * decorativa: el nombre ya identifica el color.
 *
 * @param name Nombre del color.
 * @param hex Color en hexadecimal para la muestra.
 */
export function VariantColor({ name, hex }: { name: string; hex: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="size-3.5 shrink-0 rounded-full ring-1 ring-foreground/20"
        style={{ backgroundColor: hex }}
      />
      {name}
    </span>
  );
}
