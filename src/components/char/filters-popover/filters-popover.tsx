import { useState } from "react";
import { Check, ListFilter } from "lucide-react";
import { Button } from "@/components/char/button";
import { Checkbox } from "@/components/char/checkbox";
import { Input } from "@/components/char/input";
import { Label } from "@/components/char/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/char/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  FilterDefinition,
  FilterOption,
  FilterValues,
} from "./filters.types";
import { joinMultiValue, parseMultiValue } from "./filters.utils";

/** Valor interno de "Todos" en el select (el select no admite `''`). */
const ALL = "__all__";

const countActive = (values: FilterValues) =>
  Object.values(values).filter(Boolean).length;

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {[{ value: "", label: "Todos" }, ...options].map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 rounded-full border px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function MultiChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = parseMultiValue(value);
  const toggle = (optionValue: string) =>
    onChange(
      joinMultiValue(
        selected.includes(optionValue)
          ? selected.filter((v) => v !== optionValue)
          : options
              .map((o) => o.value)
              .filter((v) => v === optionValue || selected.includes(v)),
      ),
    );
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const pressed = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={pressed}
            onClick={() => toggle(option.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              pressed
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {pressed ? <Check className="size-3.5" aria-hidden /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterField({
  filter,
  value,
  onChange,
}: {
  filter: FilterDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  switch (filter.type) {
    case "chips":
      return (
        <ChipGroup
          label={filter.label}
          options={filter.options}
          value={value}
          onChange={onChange}
        />
      );
    case "multiselect":
      return (
        <MultiChipGroup
          label={filter.label}
          options={filter.options}
          value={value}
          onChange={onChange}
        />
      );
    case "select": {
      const items = {
        [ALL]: filter.placeholder ?? "Todos",
        ...Object.fromEntries(filter.options.map((o) => [o.value, o.label])),
      };
      return (
        <Select
          items={items}
          value={value || ALL}
          onValueChange={(next) => onChange(next === ALL ? "" : String(next))}
        >
          <SelectTrigger aria-label={filter.label} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(items).map(([optionValue, optionLabel]) => (
              <SelectItem key={optionValue} value={optionValue}>
                {optionLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    case "text":
      return (
        <Input
          type="text"
          aria-label={filter.label}
          value={value}
          placeholder={filter.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "date":
      return (
        <Input
          type="date"
          aria-label={filter.label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "checkbox":
      return (
        <Label className="cursor-pointer gap-2.5">
          <Checkbox
            checked={value === "true"}
            onCheckedChange={(checked) => onChange(checked ? "true" : "")}
          />
          {filter.label}
        </Label>
      );
  }
}

/**
 * Botón "Filtros" de Char que despliega un panel con los filtros configurados.
 * Es genérico: los filtros se describen con un arreglo de `FilterDefinition`
 * (`chips`, `select`, `multiselect`, `text`, `date` o `checkbox`) y el valor
 * es un `Record<clave, string>` (un filtro vacío está inactivo; el
 * `multiselect` guarda sus opciones separadas por coma, ver `parseMultiValue`
 * y `joinMultiValue`). Los cambios se
 * editan en un borrador y solo se aplican con "Aplicar"; "Limpiar" quita todos.
 * El botón muestra cuántos filtros hay activos.
 *
 * @param filters Definición de los filtros que muestra el panel.
 * @param value Valores aplicados actualmente.
 * @param onChange Se llama con los nuevos valores al presionar "Aplicar" o
 * "Limpiar".
 */
export function FiltersPopover({
  filters,
  value,
  onChange,
  className,
}: {
  filters: FilterDefinition[];
  value: FilterValues;
  onChange: (value: FilterValues) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(value);
  const activeCount = countActive(value);

  const handleOpenChange = (next: boolean) => {
    // Al abrir, el borrador parte de lo aplicado.
    if (next) setDraft(value);
    setOpen(next);
  };

  const apply = () => {
    onChange(draft);
    setOpen(false);
  };

  const clear = () => {
    setDraft({});
    onChange({});
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={<Button variant="secondary" className={className} />}
      >
        <ListFilter aria-hidden />
        Filtros
        {activeCount > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
            {activeCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-col gap-2">
              {filter.type !== "checkbox" && (
                <p className="text-sm font-medium">{filter.label}</p>
              )}
              <FilterField
                filter={filter}
                value={draft[filter.key] ?? ""}
                onChange={(next) =>
                  setDraft((prev) => ({ ...prev, [filter.key]: next }))
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between gap-2 border-t border-border pt-3">
          <Button type="button" variant="ghost" onClick={clear}>
            Limpiar
          </Button>
          <Button type="button" onClick={apply}>
            <Check aria-hidden />
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
