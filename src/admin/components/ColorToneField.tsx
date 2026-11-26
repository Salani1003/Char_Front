import { useRef } from "react";
import { Button } from "@/components/char/button";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import { cn } from "@/lib/utils";
import { isHexColor } from "../utils/isHexColor";
import { isSameTone, TONE_SUGGESTIONS } from "../utils/colorTone";

/** Valor del selector nativo cuando todavía no hay un tono válido (nunca se envía). */
const PICKER_FALLBACK = "#000000";

/**
 * Campo "Tono (opcional)" del alta de color. Controlado: `value` es el código
 * `#RRGGBB` escrito, o `""` para **"sin tono"** (el estado inicial).
 *
 * - **Sin tono**: muestra una muestra vacía, el campo de texto vacío ("Sin
 *   tono") y el botón **"Elegir tono"**, que abre el selector de color del
 *   navegador. Como ese selector siempre arranca con un color (negro), el
 *   valor solo cambia cuando la persona elige uno: así un color nuevo no
 *   queda negro por accidente.
 * - **Con tono**: la muestra es el propio `<input type="color">` y el campo
 *   de texto con el código; ambos están sincronizados en los dos sentidos.
 *   "Quitar tono" vuelve al estado vacío.
 * - **Tonos sugeridos**: fila de botones (cada uno con `aria-label` con su
 *   nombre y `aria-pressed` el que coincide con el valor).
 * - Un código que no es `#RRGGBB` se marca con `error` (la validación la hace
 *   el formulario con `isValidToneInput`).
 *
 * @param value Código `#RRGGBB` escrito, o `""` si no hay tono.
 * @param onChange Recibe el nuevo texto del tono (`""` al quitarlo).
 * @param error Mensaje de error del campo, si lo hay.
 * @param id `id` del campo de texto (lo usa la etiqueta).
 */
export function ColorToneField({
  value,
  onChange,
  error,
  id = "hex",
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const tone = value.trim();
  const hasTone = tone !== "";
  const validTone = isHexColor(tone);

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === "function") picker.showPicker();
    else picker.click();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        Tono{" "}
        <span className="font-normal text-muted-foreground">(opcional)</span>
      </Label>
      <div className="flex items-center gap-2">
        <span className="relative flex size-9 shrink-0">
          {hasTone && validTone ? null : (
            <span
              aria-hidden
              className="absolute inset-0 rounded-md border border-dashed border-input"
            />
          )}
          <input
            ref={pickerRef}
            type="color"
            value={validTone ? tone.toLowerCase() : PICKER_FALLBACK}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            aria-label="Abrir el selector de color"
            tabIndex={hasTone && validTone ? 0 : -1}
            aria-hidden={hasTone && validTone ? undefined : true}
            className={cn(
              "size-9 cursor-pointer rounded-md border border-input bg-transparent p-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              hasTone && validTone ? "" : "pointer-events-none opacity-0",
            )}
          />
        </span>
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Sin tono"
          autoComplete="off"
          spellCheck={false}
          maxLength={7}
          aria-invalid={!!error}
          aria-describedby={`${id}-hint`}
          className="flex-1 tabular-nums"
        />
        {hasTone ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => onChange("")}
          >
            Quitar tono
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={openPicker}>
            Elegir tono
          </Button>
        )}
      </div>
      <div
        role="group"
        aria-label="Tonos sugeridos"
        className="flex flex-wrap gap-2"
      >
        {TONE_SUGGESTIONS.map((suggestion) => {
          const selected = hasTone && isSameTone(tone, suggestion.hex);
          return (
            <button
              key={suggestion.hex}
              type="button"
              aria-label={suggestion.name}
              aria-pressed={selected}
              title={suggestion.name}
              onClick={() => onChange(suggestion.hex)}
              style={{ backgroundColor: suggestion.hex }}
              className={cn(
                "size-7 rounded-full ring-1 ring-foreground/20 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected && "ring-2 ring-primary ring-offset-2",
              )}
            />
          );
        })}
      </div>
      {error ? (
        <span id={`${id}-hint`} className="text-sm text-danger">
          {error}
        </span>
      ) : (
        <span id={`${id}-hint`} className="text-sm text-muted-foreground">
          Elegí un tono con el selector, escribí el código (#RRGGBB) o tocá uno
          sugerido. Solo se usa para mostrar el color en pantalla.
        </span>
      )}
    </div>
  );
}
