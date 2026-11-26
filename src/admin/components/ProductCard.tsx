import { Link } from "react-router";
import { Layers, Tag, Wallet } from "lucide-react";
import { ActionsMenu } from "@/components/char/actions-menu";
import type { ActionsMenuItem } from "@/components/char/actions-menu";
import { Button } from "@/components/char/button";
import { EntityCard } from "@/components/char/entity-card";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { ProductVariantsSummary } from "./ProductVariantsSummary";
import { VariantPrice } from "./VariantPrice";
import type { ProductListItem } from "../interfaces/product.interface";

/**
 * Tarjeta de un producto para la vista "Productos" en celulares
 * (`ProductsCardList`). Adapta un `ProductListItem` a `EntityCard`: nombre,
 * categoría como subtítulo, estado de publicación, marca / modelo, variantes
 * (`ProductVariantsSummary`) y precio vigente. Al pie, "Ver producto" (lleva a
 * la edición) y el menú de tres puntitos con las opciones permitidas.
 *
 * @param product Producto a mostrar.
 * @param menuItems Opciones del menú, ya filtradas por permiso (`useProductMenuItems`).
 */
export function ProductCard({
  product,
  menuItems,
}: {
  product: ProductListItem;
  menuItems: ActionsMenuItem[];
}) {
  const brand = [product.brand_name, product.product_model_name]
    .filter(Boolean)
    .join(" · ");
  return (
    <EntityCard
      title={product.name}
      subtitle={product.category_label}
      badge={<ProductStatusBadge published={product.is_published} />}
      menu={
        menuItems.length ? (
          <ActionsMenu
            label={`Acciones de ${product.name}`}
            items={menuItems}
          />
        ) : undefined
      }
      details={[
        { icon: <Tag />, label: "Marca / Modelo", value: brand || "—" },
        {
          icon: <Layers />,
          label: "Variantes",
          value: (
            <ProductVariantsSummary
              count={product.variants_count}
              variants={product.variants}
            />
          ),
        },
        {
          icon: <Wallet />,
          label: "Precio vigente",
          value: <VariantPrice variant={product} />,
        },
      ]}
      actions={
        <Button
          variant="secondary"
          size="sm"
          render={<Link to={`/admin/products/${product.id}`} />}
          nativeButton={false}
          aria-label={`Ver producto ${product.name}`}
        >
          Ver producto
        </Button>
      }
    />
  );
}
