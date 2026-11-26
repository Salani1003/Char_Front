import { useId, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Combobox as ComboboxRoot,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Button } from "@/components/char/button";
import { Skeleton } from "@/components/char/skeleton";
import { cn } from "@/lib/utils";
import { filterByLabel, groupOptions, splitByMatch } from "./highlight-match";

/** Entrada interna de la lista: una opción real o la fila "Crear…". */
type Entry<T> = { kind: "option"; option: T } | { kind: "create" };

/** Grupo en el formato que espera el primitivo (`value` = encabezado). */
interface EntryGroup<T> {
  value: string;
  items: Entry<T>[];
}

const CREATE_GROUP = "__create__";

/** Resalta (en negrita) la parte de `text` que coincide con `query`. */
function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <span className="min-w-0 flex-1 truncate">
      {splitByMatch(text, query).map((segment, index) =>
        segment.match ? (
          <mark
            key={index}
            className="bg-transparent font-semibold text-inherit"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
}

export interface ComboboxProps<T> {
  /** Opción elegida, o `null`. Controlado. */
  value: T | null;
  /** Se llama al elegir una opción (`T`) o al quitar/descartar la selección (`null`). */
  onChange: (value: T | null) => void;
  /** Opciones a listar. En modo remoto son las que devolvió el padre para `onInputChange`. */
  options: readonly T[];
  /** Texto de una opción (se muestra en el campo y en la lista). */
  getOptionLabel: (option: T) => string;
  /** Identificador estable de una opción (para compararla y como `key`). */
  getOptionKey: (option: T) => string | number;
  /** Encabezado del grupo de una opción; opciones consecutivas con el mismo grupo se agrupan. */
  getOptionGroup?: (option: T) => string | null | undefined;
  /**
   * Activa el **modo remoto**: se llama con lo escrito (sin retraso; el padre
   * aplica `useDebounce`) y el componente no filtra, muestra `options` tal cual.
   * Sin esta prop el modo es **local** (filtra `options` por etiqueta).
   * Al cerrar el desplegable se llama con `""`.
   */
  onInputChange?: (query: string) => void;
  /**
   * Muestra la fila "Crear…" (con lo escrito) y el botón "+" (con `""`).
   * Si se omite, no aparece ninguno.
   */
  onCreate?: (query: string) => void;
  /** Texto de la fila de crear, ej. `(q) => \`Crear categoría «${q}»\``. */
  createLabel?: (query: string) => string;
  /** `aria-label` del botón "+", ej. "Nueva categoría". */
  createButtonLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Muestra la × para quitar el valor elegido. */
  clearable?: boolean;
  /** `aria-label` de la ×. */
  clearLabel?: string;
  /** Las opciones se están cargando (esqueleto si no hay ninguna; si hay, se atenúan). */
  loading?: boolean;
  /** Estado de error (`aria-invalid`); un texto se muestra bajo el campo. */
  error?: boolean | string;
  /** Mensaje cuando no hay opciones para lo escrito, ej. `(q) => \`No hay categorías que coincidan con «${q}»\``. */
  emptyMessage?: (query: string) => string;
  id?: string;
  name?: string;
  onBlur?: () => void;
  "aria-label"?: string;
  "aria-describedby"?: string;
  className?: string;
}

/**
 * Autocompletado de Char (campo con `role="combobox"` + lista `listbox`),
 * agnóstico de formularios y de la API (para react-hook-form ver
 * `components/forms/FormCombobox`). Envuelve el `Combobox` de base-ui, que
 * resuelve el teclado (↑ ↓ Enter Esc Tab), `aria-expanded`/`aria-controls`/
 * `aria-activedescendant` y mantiene visible la opción activa.
 *
 * - **Dos modos:** remoto (`onInputChange` presente: el padre busca y pasa
 *   `options`) y local (filtra `options` por etiqueta, sin tildes ni mayúsculas).
 * - Con resultados: opciones agrupadas (`getOptionGroup`) con lo coincidente
 *   resaltado; si hay `onCreate`, la última fila es "Crear «texto»".
 * - Sin resultados: `emptyMessage` y la misma fila de crear.
 * - Valor elegido: su etiqueta en el campo y × (`clearable`). Escribir sobre
 *   un valor elegido descarta la selección (`onChange(null)`) hasta elegir otra.
 * - Botón "+" a la derecha si hay `onCreate`: llama a `onCreate("")`.
 *
 * @param value Opción elegida (controlado) o `null`.
 * @param onChange Elegir (`T`) o descartar (`null`).
 * @param options Opciones disponibles.
 * @param getOptionLabel Texto de una opción.
 * @param getOptionKey Identificador estable de una opción.
 * @param getOptionGroup Encabezado de grupo de una opción.
 * @param onInputChange Activa el modo remoto; recibe lo escrito.
 * @param onCreate Habilita "Crear…" y el botón "+".
 * @param createLabel Texto de la fila de crear.
 * @param createButtonLabel `aria-label` del botón "+".
 * @param placeholder Texto sin valor.
 * @param disabled Deshabilita campo y botones.
 * @param clearable Muestra la × cuando hay valor.
 * @param clearLabel `aria-label` de la ×.
 * @param loading Cargando opciones.
 * @param error `true` o texto: estado inválido.
 * @param emptyMessage Mensaje de "sin resultados".
 */
export function Combobox<T>({
  value,
  onChange,
  options,
  getOptionLabel,
  getOptionKey,
  getOptionGroup,
  onInputChange,
  onCreate,
  createLabel = (query) => `Crear «${query}»`,
  createButtonLabel = "Crear nuevo",
  placeholder,
  disabled,
  clearable,
  clearLabel = "Quitar selección",
  loading,
  error,
  emptyMessage = (query) =>
    query
      ? `No hay resultados que coincidan con «${query}»`
      : "No hay opciones",
  id,
  name,
  onBlur,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  className,
}: ComboboxProps<T>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const remote = onInputChange !== undefined;
  const query = typing ? text : "";
  const trimmed = query.trim();
  const inputValue = typing ? text : value ? getOptionLabel(value) : "";
  const errorText = typeof error === "string" ? error : undefined;
  const invalid = !!error;

  const visible = remote
    ? [...options]
    : filterByLabel(options, query, getOptionLabel);
  const showCreate = !!onCreate && trimmed !== "";
  const groups: EntryGroup<T>[] = groupOptions(visible, getOptionGroup).map(
    (group) => ({
      value: group.label ?? "",
      items: group.options.map((option) => ({ kind: "option", option })),
    }),
  );
  if (showCreate) {
    groups.push({ value: CREATE_GROUP, items: [{ kind: "create" }] });
  }
  const hasEntries = groups.length > 0;

  const entryLabel = (entry: Entry<T>) =>
    entry.kind === "create"
      ? createLabel(trimmed)
      : getOptionLabel(entry.option);
  const entryKey = (entry: Entry<T>) =>
    entry.kind === "create" ? CREATE_GROUP : String(getOptionKey(entry.option));

  const selectedEntry: Entry<T> | null = value
    ? { kind: "option", option: value }
    : null;

  const resetQuery = () => {
    setTyping(false);
    setText("");
    onInputChange?.("");
  };

  const notice =
    visible.length === 0 ? (
      loading ? (
        <div
          role="status"
          className="flex flex-col gap-2 p-2"
          aria-label="Cargando opciones"
        >
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : (
        <p className="px-2.5 py-2 text-sm text-muted-foreground">
          {emptyMessage(trimmed)}
        </p>
      )
    ) : null;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2">
        <div ref={anchorRef} className="relative min-w-0 flex-1">
          <ComboboxRoot<Entry<T>>
            id={inputId}
            name={name}
            disabled={disabled}
            items={groups}
            filteredItems={groups}
            filter={null}
            autoHighlight
            value={selectedEntry}
            inputValue={inputValue}
            itemToStringLabel={entryLabel}
            itemToStringValue={entryKey}
            isItemEqualToValue={(a, b) => entryKey(a) === entryKey(b)}
            onInputValueChange={(next, details) => {
              if (details.reason !== "input-change") return;
              setTyping(true);
              setText(next);
              onInputChange?.(next);
              if (value !== null) onChange(null);
            }}
            onValueChange={(entry) => {
              if (!entry) return;
              if (entry.kind === "create") {
                onCreate?.(trimmed);
                return;
              }
              onChange(entry.option);
              resetQuery();
            }}
            onOpenChange={(open) => {
              if (!open) resetQuery();
            }}
          >
            <ComboboxInput
              ref={inputRef}
              placeholder={placeholder}
              aria-label={ariaLabel}
              aria-invalid={invalid || undefined}
              aria-describedby={
                [ariaDescribedBy, errorText ? errorId : undefined]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              aria-busy={loading || undefined}
              autoComplete="off"
              onBlur={onBlur}
              className={cn(clearable && value && "pr-8")}
            />
            <ComboboxContent anchor={anchorRef}>
              {hasEntries && notice}
              <ComboboxList
                className={cn(loading && visible.length > 0 && "opacity-60")}
              >
                {(group: EntryGroup<T>) => (
                  <ComboboxGroup key={group.value} items={group.items}>
                    {group.value && group.value !== CREATE_GROUP ? (
                      <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
                    ) : null}
                    <ComboboxCollection>
                      {(entry: Entry<T>) => (
                        <ComboboxItem key={entryKey(entry)} value={entry}>
                          {entry.kind === "create" ? (
                            <>
                              <Plus aria-hidden />
                              <span className="min-w-0 flex-1 truncate">
                                {createLabel(trimmed)}
                              </span>
                            </>
                          ) : (
                            <Highlight
                              text={getOptionLabel(entry.option)}
                              query={query}
                            />
                          )}
                        </ComboboxItem>
                      )}
                    </ComboboxCollection>
                  </ComboboxGroup>
                )}
              </ComboboxList>
              <ComboboxEmpty>{notice}</ComboboxEmpty>
            </ComboboxContent>
          </ComboboxRoot>
          {clearable && value && !disabled ? (
            <button
              type="button"
              aria-label={clearLabel}
              onClick={() => {
                onChange(null);
                resetQuery();
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-1 my-auto flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
        {onCreate ? (
          <Button
            type="button"
            variant="magenta"
            size="icon"
            aria-label={createButtonLabel}
            disabled={disabled}
            onClick={() => onCreate("")}
          >
            <Plus aria-hidden />
          </Button>
        ) : null}
      </div>
      {errorText ? (
        <span id={errorId} className="text-sm text-danger">
          {errorText}
        </span>
      ) : null}
    </div>
  );
}
