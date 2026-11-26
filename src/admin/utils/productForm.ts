import { z } from "zod";
import type { CreateProductRequest } from "../interfaces/product.request";
import { parseMoney } from "./money";
import { validatePromotion } from "./productPromo";

const moneyText = (message: string) =>
  z.string().refine((value) => parseMoney(value) !== null, message);

/**
 * Esquema del formulario "Nuevo producto". Son ayudas previas al envío (el
 * backend vuelve a validar): nombre, categoría y precio de venta
 * obligatorios; importes válidos; promoción completa o vacía con
 * `desde <= hasta` y `promo < venta` (`validatePromotion`). Las ids son
 * `number | null`; el dinero y las fechas son texto.
 */
export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    slug: z.string(),
    description: z.string(),
    category: z.number().nullable(),
    brand: z.number().nullable(),
    product_model: z.number().nullable(),
    cost_price: z
      .string()
      .refine(
        (value) => value.trim() === "" || parseMoney(value) !== null,
        "Ingresá un importe válido",
      ),
    sale_price: z
      .string()
      .trim()
      .min(1, "El precio de venta es obligatorio")
      .pipe(moneyText("Ingresá un importe válido")),
    promo_price: z.string(),
    promo_start: z.string(),
    promo_end: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.category === null) {
      ctx.addIssue({
        code: "custom",
        path: ["category"],
        message: "La categoría es obligatoria",
      });
    }
    const errors = validatePromotion({
      salePrice: values.sale_price,
      promoPrice: values.promo_price,
      promoStart: values.promo_start,
      promoEnd: values.promo_end,
    });
    for (const [field, message] of Object.entries(errors)) {
      ctx.addIssue({ code: "custom", path: [field], message });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

/** Nombres de los campos del formulario (para `applyApiErrors`). */
export const PRODUCT_FORM_FIELDS = [
  "name",
  "slug",
  "description",
  "category",
  "brand",
  "product_model",
  "cost_price",
  "sale_price",
  "promo_price",
  "promo_start",
  "promo_end",
] as const;

/** Valores iniciales: todo vacío (los ids en `null`). */
export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  category: null,
  brand: null,
  product_model: null,
  cost_price: "",
  sale_price: "",
  promo_price: "",
  promo_start: "",
  promo_end: "",
};

/**
 * Arma el cuerpo de `POST /products/` desde los valores del formulario:
 * omite los campos vacíos, convierte el dinero a string decimal
 * (`"90.000,00"` → `"90000.00"`), envía el slug en minúsculas solo si se
 * escribió y **nunca** manda `is_published`. El costo solo viaja si
 * `canSetCost` (permiso `products.view_cost_price`).
 *
 * @param values Valores ya validados del formulario (`category` no nulo).
 * @param canSetCost Si la persona puede cargar el precio de costo.
 */
export function buildCreateProductRequest(
  values: ProductFormValues,
  canSetCost: boolean,
): CreateProductRequest {
  const slug = values.slug.trim().toLowerCase();
  const description = values.description.trim();
  const cost = parseMoney(values.cost_price);
  const promoPrice = parseMoney(values.promo_price);
  return {
    name: values.name.trim(),
    category: values.category as number,
    sale_price: parseMoney(values.sale_price) as string,
    ...(slug && { slug }),
    ...(description && { description }),
    ...(values.brand !== null && { brand: values.brand }),
    ...(values.product_model !== null && {
      product_model: values.product_model,
    }),
    ...(canSetCost && cost && { cost_price: cost }),
    ...(promoPrice && {
      promo_price: promoPrice,
      promo_start: values.promo_start,
      promo_end: values.promo_end,
    }),
  };
}
