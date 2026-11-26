import type { Brand } from "../interfaces/brand.interface";
import type { Category } from "../interfaces/category.interface";
import type {
  Product,
  ProductVariantItem,
} from "../interfaces/product.interface";
import type { ProductModel } from "../interfaces/product-model.interface";
import type { UpdateProductRequest } from "../interfaces/product.request";
import { formatMoney, parseMoney } from "./money";
import type { ProductFormValues } from "./productForm";
import { formatIsoDate } from "./productPromo";

/** `"90000.00"` → `"90.000,00"` (el texto que muestran los campos de dinero); `""` si no es un decimal. */
const toMoneyText = (value: string | null | undefined) =>
  value ? formatMoney(value).replace("$ ", "") : "";

/**
 * Valores iniciales del formulario de edición a partir del producto de la API:
 * dinero en formato argentino (`90.000,00`), promoción y descripción vacías
 * como `""` y `cost_price` vacío si la API no lo devolvió (sin
 * `products.view_cost_price`).
 */
export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    category: product.category,
    brand: product.brand,
    product_model: product.product_model,
    cost_price: toMoneyText(product.cost_price),
    sale_price: toMoneyText(product.sale_price),
    promo_price: toMoneyText(product.promo_price),
    promo_start: product.promo_start ?? "",
    promo_end: product.promo_end ?? "",
  };
}

/** Texto de dinero → decimal normalizado para comparar (`""` si está vacío o es inválido). */
const normalizeMoney = (text: string) => parseMoney(text) ?? "";

/**
 * Arma el cuerpo de `PATCH /products/:id/` con **solo los campos que cambiaron**
 * respecto de los valores iniciales (los de `productToFormValues`):
 * - texto: se compara recortado; el dinero, ya convertido a string decimal
 *   (`"90000.00"`), así `90000` y `90.000,00` no cuentan como cambio;
 * - `brand`/`product_model`: id o `null` para vaciarlos;
 * - **promoción**: los tres campos viajan juntos. Si cambió alguno se envían
 *   los tres; si quedó vacía y antes tenía, se envían los tres en `null`;
 * - **slug**: en minúsculas. Vacío significa "regenerar desde el nombre"
 *   (`slug: ""`) y solo se envía si el producto **no** está publicado;
 * - `cost_price` solo si `canSetCost` y no se vació (la API no admite `null`).
 *
 * Devuelve `{}` si no hay cambios. Se espera que `values` ya pasó la
 * validación del formulario (`category` no nulo, promoción completa o vacía).
 *
 * @param initial Valores con los que se cargó el formulario.
 * @param values Valores actuales.
 * @param options `canSetCost`: tiene `products.view_cost_price`; `isPublished`: el producto está publicado.
 */
export function buildUpdateProductRequest(
  initial: ProductFormValues,
  values: ProductFormValues,
  { canSetCost, isPublished }: { canSetCost: boolean; isPublished: boolean },
): UpdateProductRequest {
  const request: UpdateProductRequest = {};

  const name = values.name.trim();
  if (name !== initial.name.trim()) request.name = name;

  const description = values.description.trim();
  if (description !== initial.description.trim()) {
    request.description = description;
  }

  const slug = values.slug.trim().toLowerCase();
  if (slug !== initial.slug.trim().toLowerCase() && (slug || !isPublished)) {
    request.slug = slug;
  }

  if (values.category !== initial.category && values.category !== null) {
    request.category = values.category;
  }
  if (values.brand !== initial.brand) request.brand = values.brand;
  if (values.product_model !== initial.product_model) {
    request.product_model = values.product_model;
  }

  const sale = normalizeMoney(values.sale_price);
  if (sale && sale !== normalizeMoney(initial.sale_price)) {
    request.sale_price = sale;
  }
  const cost = normalizeMoney(values.cost_price);
  if (canSetCost && cost && cost !== normalizeMoney(initial.cost_price)) {
    request.cost_price = cost;
  }

  const promoPrice = normalizeMoney(values.promo_price);
  const promoStart = values.promo_start.trim();
  const promoEnd = values.promo_end.trim();
  const hadPromo = Boolean(
    normalizeMoney(initial.promo_price) ||
    initial.promo_start ||
    initial.promo_end,
  );
  const hasPromo = Boolean(promoPrice || promoStart || promoEnd);
  const promoChanged =
    promoPrice !== normalizeMoney(initial.promo_price) ||
    promoStart !== initial.promo_start ||
    promoEnd !== initial.promo_end;
  if (promoChanged) {
    if (hasPromo) {
      request.promo_price = promoPrice;
      request.promo_start = promoStart;
      request.promo_end = promoEnd;
    } else if (hadPromo) {
      request.promo_price = null;
      request.promo_start = null;
      request.promo_end = null;
    }
  }
  return request;
}

/** Resumen de las variantes de un producto. */
export interface VariantsSummary {
  variants: number;
  /** Colores distintos. */
  colors: number;
  /** Nombres de los talles distintos, ordenados por `order` (ej. `["XS", "S", "L"]`). */
  sizes: string[];
}

/**
 * Cuenta variantes y colores distintos (por id) y lista los talles distintos
 * (por id) ordenados por `order`, es decir, los talles disponibles.
 */
export function summarizeVariants(
  variants: readonly ProductVariantItem[],
): VariantsSummary {
  return {
    variants: variants.length,
    colors: new Set(variants.map((v) => v.color.id)).size,
    sizes: [
      ...new Map(variants.map((v) => [v.size.id, v.size] as const)).values(),
    ]
      .sort((a, b) => a.order - b.order)
      .map((size) => size.name),
  };
}

/**
 * Opciones "de solo etiqueta" para que los autocompletados muestren la
 * categoría, marca y modelo del producto sin pedirlos a la API: el producto ya
 * trae `category_label`, `brand_name` y `product_model_name`. Solo `id` y el
 * nombre/etiqueta son fiables; el resto de los campos son de relleno.
 */
export function productInitialOptions(product: Product): {
  category: Category;
  brand: Brand | undefined;
  productModel: ProductModel | undefined;
} {
  const label = product.category_label;
  return {
    category: {
      id: product.category,
      name: label.split("›").pop()?.trim() ?? label,
      slug: "",
      parent: null,
      parent_name: label.includes("›") ? label.split("›")[0].trim() : null,
      label,
      has_children: false,
      products_count: 0,
      created_at: "",
    },
    brand:
      product.brand !== null && product.brand_name
        ? {
            id: product.brand,
            name: product.brand_name,
            slug: "",
            created_at: "",
          }
        : undefined,
    productModel:
      product.product_model !== null && product.product_model_name
        ? {
            id: product.product_model,
            name: product.product_model_name,
            brand: product.brand ?? 0,
            created_at: "",
          }
        : undefined,
  };
}

/**
 * Línea que explica el **precio vigente que calculó la API** de un producto
 * guardado (`current_price`, `is_on_promo`), sin recalcularlo en el front:
 * - `is_on_promo`: rige el promocional hasta `promo_end` (inclusive);
 * - promoción que todavía no empezó (`today < promo_start`): rige la venta y
 *   se avisa cuándo empieza;
 * - si no, rige el precio de venta.
 *
 * @param product Producto devuelto por la API.
 * @param today Fecha de hoy `YYYY-MM-DD` (ver `toLocalIsoDate`); se recibe para que la función sea pura.
 */
export function describeApiCurrentPrice(
  product: Pick<Product, "is_on_promo" | "promo_start" | "promo_end">,
  today: string,
): string {
  if (product.is_on_promo && product.promo_end) {
    return `Hoy rige el precio promocional, hasta el ${formatIsoDate(product.promo_end)} inclusive.`;
  }
  if (product.promo_start && product.promo_end && today < product.promo_start) {
    return `Hoy rige el precio de venta. La promoción empieza el ${formatIsoDate(product.promo_start)}.`;
  }
  return "Hoy rige el precio de venta.";
}
