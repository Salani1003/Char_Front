import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { useCan } from "@/auth/lib/permissions";
import { adminNavItems } from "../config/admin-nav";
import type { AdminNavItem } from "../config/admin-nav";

/** Normaliza para comparar sin tildes ni mayúsculas. */
const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Buscador del header del backoffice: sugiere pantallas (las de
 * `adminNavItems` que el usuario puede ver, según `can`) mientras se escribe, sin distinguir tildes ni mayúsculas, y
 * navega a la elegida. Es un combobox accesible: flechas arriba/abajo para
 * moverse, Enter para ir, Escape para cerrar. El atajo `/` (fuera de un campo
 * de texto) enfoca el buscador.
 */
export function AdminSearch() {
  const navigate = useNavigate();
  const can = useCan();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const term = normalize(query);
  const results: AdminNavItem[] = term
    ? adminNavItems.filter(
        (item) =>
          (!item.permission || can(item.permission)) &&
          normalize(item.label).includes(term),
      )
    : [];
  const showList = open && query.trim() !== "";

  // Atajo "/" para ir directo al buscador.
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || isTypingTarget(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const select = (item: AdminNavItem) => {
    void navigate(item.to);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(results[activeIndex] ?? results[0]);
    }
  };

  return (
    <div className="group relative min-w-0 flex-1 md:max-w-sm">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground"
      />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && results.length ? `${listId}-${activeIndex}` : undefined
        }
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        placeholder="Buscar en el panel…"
        aria-label="Buscar en el panel"
        className="h-9 w-full rounded-control border border-input bg-card pr-8 pl-8 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <kbd
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 hidden h-5 min-w-5 -translate-y-1/2 place-items-center rounded border border-border px-1 font-sans text-xs text-muted-foreground group-focus-within:hidden sm:grid"
      >
        /
      </kbd>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-11 right-0 left-0 z-40 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-muted-foreground">
              Sin resultados
            </li>
          ) : (
            results.map(({ label, to, icon: Icon }, index) => (
              <li
                key={to}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // mousedown evita que el blur del input cierre la lista antes del click
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(results[index])}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground",
                  index === activeIndex && "bg-accent text-accent-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
