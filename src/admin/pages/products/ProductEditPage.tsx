import { useEffect, useState } from "react";
import { Link, useBlocker, useNavigate, useParams, useSearchParams } from "react-router";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { AlertDialog } from "@/components/char/alert-dialog";
import { Badge } from "@/components/char/badge";
import { Button } from "@/components/char/button";
import { PageHeader } from "@/components/char/page-header";
import { StateMessage } from "@/components/char/state-message";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/char/tabs";
import { toast } from "@/components/char/sonner";
import { applyApiErrors } from "@/lib/applyApiErrors";
import { toApiError } from "@/lib/apiError";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ProductCurrentPriceCard } from "@/admin/components/ProductCurrentPriceCard";
import { ProductDeleteDialog } from "@/admin/components/ProductDeleteDialog";
import { ProductEditSkeleton } from "@/admin/components/ProductEditSkeleton";
import { ProductFormFields } from "@/admin/components/ProductFormFields";
import { ProductPublicationCard } from "@/admin/components/ProductPublicationCard";
import { ProductSummaryCard } from "@/admin/components/ProductSummaryCard";
import { ProductVariantsSection } from "@/admin/components/ProductVariantsSection";
import { useBreadcrumbLabel } from "@/admin/hooks/useBreadcrumbLabel";
import {
  useProduct,
  useProductWithVariants,
  useUpdateProduct,
} from "@/admin/hooks/useProducts";
import type {
  Product,
  ProductVariantItem,
} from "@/admin/interfaces/product.interface";
import {
  buildUpdateProductRequest,
  productInitialOptions,
  productToFormValues,
  summarizeVariants,
} from "@/admin/utils/productEdit";
import {
  PRODUCT_FORM_FIELDS,
  productFormSchema,
  type ProductFormValues,
} from "@/admin/utils/productForm";
import { Skeleton } from "@/components/char/skeleton";

type ProductTab = "data" | "variants";

/**
 * Pantalla "Editar producto" (`/admin/products/:id`, permiso
 * `products.view_product`). Carga `GET /products/:id/` y, con
 * `products.view_productvariant`, `GET /products/:id/with-variants/`
 * (sin ese permiso la pestaña Variantes no existe). Estados: carga con
 * esqueleto, error con "Reintentar" y 404 ("Producto no encontrado"). El
 * nombre del producto va como último tramo de las migas de pan.
 *
 * Ver `ProductEditView` para el contenido.
 */
export const ProductEditPage = () => {
  const { id } = useParams();
  const productId = /^\d+$/.test(id ?? "") ? Number(id) : null;
  const can = useCan();
  const canViewVariants = can(PERMISSIONS.products.productVariant.view);
  const product = useProduct(productId);
  const withVariants = useProductWithVariants(productId, {
    enabled: canViewVariants,
  });
  useDocumentTitle(
    product.data ? `${product.data.name} · Char` : "Producto · Char",
  );
  useBreadcrumbLabel(product.data?.name);

  const notFound =
    productId === null ||
    (axios.isAxiosError(product.error) &&
      product.error.response?.status === 404);
  if (notFound) {
    return (
      <StateMessage
        variant="empty"
        action={
          <Button
            variant="secondary"
            render={<Link to="/admin/products">Volver a productos</Link>}
          />
        }
      >
        Producto no encontrado
      </StateMessage>
    );
  }
  if (product.isPending && !product.error) return <ProductEditSkeleton />;
  if (product.error || !product.data) {
    return (
      <StateMessage
        variant="error"
        action={
          <Button variant="secondary" onClick={() => void product.refetch()}>
            Reintentar
          </Button>
        }
      >
        {toApiError(product.error).message}
      </StateMessage>
    );
  }
  return (
    <ProductEditView
      key={product.data.id}
      product={product.data}
      canViewVariants={canViewVariants}
      variants={withVariants.data?.variants}
      variantsLoading={canViewVariants && withVariants.isPending}
      variantsError={
        withVariants.error ? toApiError(withVariants.error).message : null
      }
      onRetryVariants={() => void withVariants.refetch()}
    />
  );
};

/**
 * Contenido de la edición de un producto ya cargado: encabezado (nombre,
 * estado, "Eliminar producto" y "Guardar cambios"), pestañas "Datos y
 * precios" y "Variantes (n)" y la columna lateral (Publicación, Precio
 * vigente, Resumen).
 *
 * - **Datos y precios**: el mismo formulario del alta (`ProductFormFields`)
 *   precargado. `PATCH /products/:id/` envía solo los campos que cambiaron
 *   (`buildUpdateProductRequest`); tras guardar el formulario se reinicia con
 *   lo que devolvió la API (valores normalizados).
 * - **Slug**: publicado → no se regenera solo (ayuda y sin botón); sin
 *   publicar → "Regenerar desde el nombre" lo deja vacío y al guardar se envía
 *   `slug: ""`. Un publicado no puede quedar sin dirección.
 * - **Promoción**: "Quitar promoción" vacía los tres campos; al guardar se
 *   envían en `null`.
 * - **Costo**: solo con `products.view_cost_price`.
 * - **Sin `change_product`**: modo lectura (campos deshabilitados, sin
 *   "Guardar cambios", interruptor deshabilitado).
 * - **Pestaña inicial**: `?tab=variants` (con permiso de ver variantes) abre
 *   "Variantes"; si no, "Datos y precios".
 * - **Variantes**: `ProductVariantsSection` (tabla, panel "Agregar variantes" y eliminar).
 * - **Eliminar**: con `delete_product` y confirmación; el error del backend se
 *   muestra en el diálogo.
 * - Salir con cambios sin guardar pide confirmación.
 *
 * @param product Producto cargado.
 * @param canViewVariants Si hay permiso para ver variantes (muestra la pestaña).
 * @param variants Variantes activas (`undefined` mientras no cargan o sin permiso).
 * @param variantsLoading Si las variantes todavía cargan.
 * @param variantsError Mensaje si falló la carga de variantes.
 * @param onRetryVariants Reintenta la carga de variantes.
 */
function ProductEditView({
  product,
  canViewVariants,
  variants,
  variantsLoading,
  variantsError,
  onRetryVariants,
}: {
  product: Product;
  canViewVariants: boolean;
  variants: ProductVariantItem[] | undefined;
  variantsLoading: boolean;
  variantsError: string | null;
  onRetryVariants: () => void;
}) {
  const navigate = useNavigate();
  const can = useCan();
  const canChange = can(PERMISSIONS.products.product.change);
  const canDelete = can(PERMISSIONS.products.product.delete);
  const canCost = can(PERMISSIONS.products.costPrice);
  const { mutateAsync: updateProduct } = useUpdateProduct();

  const [initial, setInitial] = useState(() => productToFormValues(product));
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initial,
  });
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { isSubmitting, isDirty },
  } = form;
  const promo = useWatch({
    control,
    name: ["promo_price", "promo_start", "promo_end"],
  });
  // `?tab=variants` (desde "Ver variantes" del listado) abre esa pestaña.
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<ProductTab>(
    canViewVariants && searchParams.get("tab") === "variants"
      ? "variants"
      : "data",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !leaving && currentLocation.pathname !== nextLocation.pathname,
  );

  // Va después de `useBlocker`: así el bloqueo ya se levantó al navegar.
  useEffect(() => {
    if (leaving) void navigate("/admin/products", { replace: true });
  }, [leaving, navigate]);

  useEffect(() => {
    if (!isDirty || leaving) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty, leaving]);

  const published = product.is_published;
  const summary = variants ? summarizeVariants(variants) : undefined;
  const hasPromoValues = promo.some((value) => value.trim() !== "");

  const onSubmit = async (values: ProductFormValues) => {
    setFormError(null);
    if (published && values.slug.trim() === "") {
      setError(
        "slug",
        { message: "Un producto publicado necesita una dirección" },
        { shouldFocus: true },
      );
      return;
    }
    const payload = buildUpdateProductRequest(initial, values, {
      canSetCost: canCost,
      isPublished: published,
    });
    if (Object.keys(payload).length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }
    try {
      const updated = await updateProduct({ id: product.id, payload });
      const next = productToFormValues(updated);
      setInitial(next);
      reset(next);
      toast.success("Cambios guardados");
    } catch (error) {
      const message = applyApiErrors(error, setError, PRODUCT_FORM_FIELDS);
      if (message) setFormError(message);
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    setTab("data");
    // Los autocompletados no registran su `ref` en el formulario: se enfocan por id.
    const first = Object.keys(errors)[0];
    if (first) document.getElementById(first)?.focus();
  };

  const removePromotion = () => {
    for (const field of ["promo_price", "promo_start", "promo_end"] as const) {
      setValue(field, "", { shouldDirty: true, shouldValidate: true });
    }
  };

  const regenerateSlug = () => {
    setValue("slug", "", { shouldDirty: true });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="flex flex-col gap-6"
    >
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {product.name}
            <Badge variant={published ? "success" : "secondary"}>
              {published ? "Publicado" : "Sin publicar"}
            </Badge>
          </span>
        }
        description={product.category_label}
        actions={
          <>
            {canDelete ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => setDeleteOpen(true)}
              >
                Eliminar producto
              </Button>
            ) : null}
            {canChange ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando…" : "Guardar cambios"}
              </Button>
            ) : null}
          </>
        }
      />

      {formError ? (
        <StateMessage variant="error">{formError}</StateMessage>
      ) : null}

      <Tabs value={tab} onValueChange={(value) => setTab(value as ProductTab)}>
        <TabsList aria-label="Secciones del producto">
          <TabsTrigger value="data">Datos y precios</TabsTrigger>
          {canViewVariants ? (
            <TabsTrigger value="variants">
              Variantes
              {variants ? (
                <Badge variant="secondary">{variants.length}</Badge>
              ) : null}
            </TabsTrigger>
          ) : null}
        </TabsList>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <TabsContent value="data" keepMounted className="pt-0">
              <div className="flex flex-col gap-6">
                <ProductFormFields
                  form={form}
                  canCost={canCost}
                  readOnly={!canChange}
                  initialOptions={productInitialOptions(product)}
                  initialModelBrandId={product.brand}
                  slugDescription={
                    published
                      ? "Como el producto está publicado, la dirección no se regenera sola para no romper enlaces ya compartidos. Podés editarla a mano."
                      : "Podés editarla. Si la dejás vacía, se genera desde el nombre al guardar."
                  }
                  slugAction={
                    published ? null : (
                      <div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={regenerateSlug}
                        >
                          Regenerar desde el nombre
                        </Button>
                      </div>
                    )
                  }
                  promoAction={
                    hasPromoValues ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removePromotion}
                      >
                        Quitar promoción
                      </Button>
                    ) : null
                  }
                />
              </div>
            </TabsContent>
            {canViewVariants ? (
              <TabsContent value="variants" className="pt-0">
                {variantsLoading ? (
                  <Skeleton className="h-48 w-full rounded-xl" />
                ) : variantsError || !variants ? (
                  <StateMessage
                    variant="error"
                    action={
                      <Button variant="secondary" onClick={onRetryVariants}>
                        Reintentar
                      </Button>
                    }
                  >
                    {variantsError ?? "No se pudieron cargar las variantes."}
                  </StateMessage>
                ) : (
                  <ProductVariantsSection
                    product={product}
                    variants={variants}
                  />
                )}
              </TabsContent>
            ) : null}
          </div>

          <div className="flex flex-col gap-6">
            <ProductPublicationCard
              product={product}
              hasVariants={variants ? variants.length > 0 : undefined}
            />
            <ProductCurrentPriceCard product={product} />
            <ProductSummaryCard product={product} summary={summary} />
          </div>
        </div>
      </Tabs>

      <ProductDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        productId={product.id}
        productName={product.name}
        onDeleted={() => {
          toast.success("Producto eliminado");
          setLeaving(true);
        }}
      />

      <AlertDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open && blocker.state === "blocked") blocker.reset();
        }}
        variant="warning"
        title="¿Salir sin guardar?"
        description="Si salís ahora se pierden los cambios que hiciste."
        confirmLabel="Salir"
        cancelLabel="Seguir editando"
        onConfirm={() => {
          if (blocker.state === "blocked") blocker.proceed();
        }}
      />
    </form>
  );
}
