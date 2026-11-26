import { Link, useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import { Can } from "@/auth/components/Can";
import { PERMISSIONS } from "@/auth/lib/permissions";
import { Button } from "@/components/char/button";
import { PageHeader } from "@/components/char/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/char/tabs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ProductsList } from "./ProductsList";
import { ProductVariantsList } from "./ProductVariantsList";

type ProductsView = "variants" | "products";

/**
 * Pantalla de mercadería (`/admin/products`, permiso `products.view_product`
 * y `products.view_productvariant`): encabezado con "Nuevo producto"
 * (`products.add_product`) y un selector de vista, `components/char/tabs`:
 *
 * - **Variantes** (por defecto): una fila por variante (SKU, color, talle,
 *   precio) — `ProductVariantsList`.
 * - **Productos**: una fila por producto, con su cantidad de variantes;
 *   incluye los productos sin variantes — `ProductsList`.
 *
 * La vista elegida vive en la URL (`?view=products`; la de variantes es la
 * predeterminada y no se escribe). Cambiar de vista descarta la búsqueda, los
 * filtros, el orden y la página de la vista anterior, porque cada vista tiene
 * los suyos.
 */
export const ProductsPage = () => {
  useDocumentTitle("Productos · Char");
  const [params, setParams] = useSearchParams();
  const view: ProductsView =
    params.get("view") === "products" ? "products" : "variants";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Productos"
        description="Explorá la mercadería por variante (color y talle) o por producto."
        actions={
          <Can permission={PERMISSIONS.products.product.add}>
            <Button
              render={<Link to="/admin/products/new" />}
              nativeButton={false}
            >
              <Plus /> Nuevo producto
            </Button>
          </Can>
        }
      />
      <Tabs
        value={view}
        onValueChange={(next) =>
          setParams(next === "products" ? { view: "products" } : {})
        }
      >
        <TabsList aria-label="Vista del listado">
          <TabsTrigger value="variants">Variantes</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
        </TabsList>
      </Tabs>
      {view === "products" ? <ProductsList /> : <ProductVariantsList />}
    </div>
  );
};
