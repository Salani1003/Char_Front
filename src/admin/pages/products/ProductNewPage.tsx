import { useEffect, useState } from "react";
import { useBlocker, useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/char/card";
import { Label } from "@/components/char/label";
import { PageHeader } from "@/components/char/page-header";
import { StateMessage } from "@/components/char/state-message";
import { Switch } from "@/components/char/switch";
import { toast } from "@/components/char/sonner";
import { applyApiErrors } from "@/lib/applyApiErrors";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ProductFormFields } from "@/admin/components/ProductFormFields";
import { ProductPriceSummaryCard } from "@/admin/components/ProductPriceSummaryCard";
import { useCreateProduct } from "@/admin/hooks/useProducts";
import {
  buildCreateProductRequest,
  EMPTY_PRODUCT_FORM,
  PRODUCT_FORM_FIELDS,
  productFormSchema,
  type ProductFormValues,
} from "@/admin/utils/productForm";

/**
 * Pantalla "Nuevo producto" (`/admin/products/new`, permiso
 * `products.add_product`). Secciones: Datos del producto (nombre, slug,
 * descripción), Clasificación (categoría, marca y modelo con autocompletado y
 * "+"), Precios (costo, venta y Promoción opcional) y Imágenes y Variantes
 * (bloqueadas hasta guardar). El lateral muestra la Publicación (siempre "Sin publicar":
 * un producto nuevo no puede nacer publicado) y el Precio vigente (vista
 * previa calculada en el front).
 *
 * - **Costo**: el campo solo existe con `products.view_cost_price`; sin ese
 *   permiso ni se muestra ni se envía.
 * - **Dinero**: `FormMoneyInput` acepta `90.000,00` y se envía como string
 *   decimal (`"90000.00"`) con `buildCreateProductRequest`.
 * - **Modelo y marca**: elegir un modelo completa su marca; cambiar la marca
 *   limpia un modelo que no le pertenece (quitar la marca no toca el modelo).
 * - **"+"**: abren los modales de categoría, marca y modelo (nunca dos a la
 *   vez; el de modelo recibe la marca elegida) y lo creado queda seleccionado.
 * - **Slug**: vacío por defecto con la pista de lo que se generaría; si no se
 *   toca no se envía; si se edita se envía en minúsculas.
 * - **Validación**: zod (`productFormSchema`, con `validatePromotion`) como
 *   ayuda; el primer campo inválido recibe el foco. Los errores del backend se
 *   vuelcan en sus campos (`applyApiErrors`) y el resto en una alerta arriba.
 * - **Salir con cambios**: cancelar o navegar con datos sin guardar (y cerrar
 *   la pestaña) pide confirmación.
 * - **Éxito**: toast "Producto creado" y redirección a `/admin/products/:id`.
 */
export const ProductNewPage = () => {
  useDocumentTitle("Nuevo producto · Char");
  const navigate = useNavigate();
  const can = useCan();
  const canCost = can(PERMISSIONS.products.costPrice);
  const { mutateAsync: createProduct } = useCreateProduct();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY_PRODUCT_FORM,
  });
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
  } = form;
  const [salePrice, promoPrice, promoStart, promoEnd] = useWatch({
    control,
    name: ["sale_price", "promo_price", "promo_start", "promo_end"],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      createdId === null &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  // Va después de `useBlocker`: así el bloqueo ya se levantó al navegar.
  useEffect(() => {
    if (createdId !== null) {
      void navigate(`/admin/products/${createdId}`, { replace: true });
    }
  }, [createdId, navigate]);

  useEffect(() => {
    if (!isDirty || createdId !== null) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty, createdId]);

  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null);
    try {
      const product = await createProduct(
        buildCreateProductRequest(values, canCost),
      );
      toast.success("Producto creado");
      setCreatedId(product.id);
    } catch (error) {
      const message = applyApiErrors(error, setError, PRODUCT_FORM_FIELDS);
      if (message) setFormError(message);
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    // Los autocompletados no registran su `ref` en el formulario: se enfocan por id.
    const first = Object.keys(errors)[0];
    if (first) document.getElementById(first)?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Nuevo producto"
        description="Cargá los datos del producto. Las variantes (colores y talles) se agregan después de guardarlo."
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void navigate("/admin/products")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || createdId !== null}>
              {isSubmitting ? "Guardando…" : "Guardar producto"}
            </Button>
          </>
        }
      />

      {formError ? (
        <StateMessage variant="error">{formError}</StateMessage>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <ProductFormFields
            form={form}
            canCost={canCost}
            autoFocusName
            slugDescription="Se genera sola desde el nombre; si ya existe, se numera. Podés editarla. No cambia al renombrar el producto."
          />

          <Card aria-disabled>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
              <CardDescription>
                Primero guardá el producto y cargale variantes. Después vas a
                poder subir las fotos de cada color desde la pantalla de
                edición.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="secondary" disabled>
                Subir fotos
              </Button>
            </CardContent>
          </Card>

          <Card aria-disabled>
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
              <CardDescription>
                Primero guardá el producto. Después vas a poder cargar sus
                colores y talles desde la pantalla de edición.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="secondary" disabled>
                Agregar variantes
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Publicación</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <Badge variant="secondary">Sin publicar</Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="is_published">
                  Mostrar en la tienda online
                </Label>
                <Switch id="is_published" checked={false} disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                Se habilita cuando el producto tiene al menos una variante. Un
                producto nuevo siempre nace sin publicar.
              </p>
            </CardContent>
          </Card>
          <ProductPriceSummaryCard
            input={{
              salePrice,
              promoPrice,
              promoStart,
              promoEnd,
            }}
          />
        </div>
      </div>

      <AlertDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open && blocker.state === "blocked") blocker.reset();
        }}
        variant="warning"
        title="¿Salir sin guardar?"
        description="Si salís ahora se pierden los datos que cargaste."
        confirmLabel="Salir"
        cancelLabel="Seguir editando"
        onConfirm={() => {
          if (blocker.state === "blocked") blocker.proceed();
        }}
      />
    </form>
  );
};
