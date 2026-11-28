import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import { SearchBar } from "@/components/char/search-bar";
import { Skeleton } from "@/components/char/skeleton";
import { StateMessage } from "@/components/char/state-message";
import { useDebounce } from "@/hooks/useDebounce";
import { VariantColor } from "./VariantColor";
import { VariantPrice } from "./VariantPrice";
import { useProductVariants } from "../hooks/useProductVariants";
import type { ProductVariant } from "../interfaces/product-variant.interface";
import { stockErrorMessage } from "../utils/stock";

const PAGE_SIZE = 8;

/** Miniatura de la variante (o un recuadro vacío si no tiene foto). */
function Thumb({ variant }: { variant: ProductVariant }) {
  const src = variant.thumbnail_url ?? variant.image_url;
  return src ? (
    <img
      src={src}
      alt=""
      loading="lazy"
      className="size-12 shrink-0 rounded-md object-cover"
    />
  ) : (
    <span
      aria-hidden
      className="size-12 shrink-0 rounded-md bg-muted ring-1 ring-foreground/10"
    />
  );
}

/**
 * Buscador de variantes con resultados, compartido por el punto de venta y el
 * cambio ("Se lleva"). Pide `GET /product-variants/?search=` (SKU, producto,
 * marca, modelo, color o talle; retraso de 300 ms, 8 por página con
 * "Anterior/Siguiente") y muestra por resultado la foto, el producto, color y
 * talle, el SKU, el precio vigente (promo con precio de lista tachado) y el
 * stock (con `stock.view_stocklevel`: "Sin stock", "Última unidad" o "Stock
 * bajo"). El campo toma el foco al montar y de nuevo después de cada "Agregar",
 * para vender con teclado.
 *
 * @param onAdd Se llama con la variante elegida (suma una unidad).
 * @param getDisabledReason Motivo por el que no se puede agregar una variante (ej. "Agotada"), o `null`; deshabilita el botón y muestra el motivo.
 * @param addLabel Texto del botón (por defecto "Agregar").
 * @param placeholder Texto de ayuda del buscador.
 */
export function VariantPicker({
  onAdd,
  getDisabledReason,
  addLabel = "Agregar",
  placeholder = "Buscar por SKU, producto, color o talle…",
}: {
  onAdd: (variant: ProductVariant) => void;
  getDisabledReason: (variant: ProductVariant) => string | null;
  addLabel?: string;
  placeholder?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim());
  const { data, isPending, isError, error, isPlaceholderData, refetch } =
    useProductVariants({
      search: debounced,
      page,
      page_size: PAGE_SIZE,
    });

  const focusSearch = () =>
    containerRef.current?.querySelector<HTMLInputElement>("input")?.focus();

  // Foco inicial: el campo toma el foco al montar.
  useEffect(() => {
    containerRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, []);

  const total = data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <SearchBar
        value={search}
        onValueChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder={placeholder}
      />
      {isError ? (
        <StateMessage
          variant="error"
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        >
          {stockErrorMessage(error)}
        </StateMessage>
      ) : isPending ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">Buscando variantes…</span>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : data.results.length === 0 ? (
        <StateMessage variant="empty">
          No encontramos variantes con esa búsqueda.
        </StateMessage>
      ) : (
        <ul
          className={
            isPlaceholderData
              ? "flex flex-col gap-2 opacity-60 transition-opacity"
              : "flex flex-col gap-2 transition-opacity"
          }
        >
          {data.results.map((variant) => {
            const reason = getDisabledReason(variant);
            return (
              <li
                key={variant.id}
                className="flex items-center gap-3 rounded-card bg-card p-2 ring-1 ring-foreground/10"
              >
                <Thumb variant={variant} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-medium">
                    {variant.product_name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    <VariantColor
                      name={variant.color_name}
                      hex={variant.color_hex}
                    />{" "}
                    · {variant.size_name} ·{" "}
                    <span className="font-mono">{variant.sku}</span>
                  </span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <VariantPrice variant={variant} />
                    {variant.quantity ===
                    undefined ? null : variant.quantity === 0 ? (
                      <Badge variant="danger">Sin stock</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Stock {variant.quantity}
                        {variant.quantity === 1 ? (
                          <>
                            {" "}
                            <Badge variant="warning">Última unidad</Badge>
                          </>
                        ) : variant.is_low_stock ? (
                          <>
                            {" "}
                            <Badge variant="warning">Stock bajo</Badge>
                          </>
                        ) : null}
                      </span>
                    )}
                  </span>
                </div>
                {reason ? (
                  <span className="max-w-28 text-right text-xs text-muted-foreground">
                    {reason}
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`${addLabel} ${variant.sku}`}
                    onClick={() => {
                      onAdd(variant);
                      focusSearch();
                    }}
                  >
                    {addLabel}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {data && total > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            Página {page} de {pages} · {total} variantes
          </span>
          <span className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || isPlaceholderData}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pages || isPlaceholderData}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </span>
        </div>
      ) : null}
    </div>
  );
}
