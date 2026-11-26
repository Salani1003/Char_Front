import { Eye, Layers, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import type { ActionsMenuItem } from "@/components/char/actions-menu";
import type { ProductListItem } from "../interfaces/product.interface";

/**
 * Opciones del menú de acciones de un producto (vista "Productos"), filtradas
 * por permiso (`can`): "Editar" (`products.change_product`; sin él, "Ver
 * detalle"), "Ver variantes" (`products.view_productvariant`; abre la
 * pestaña Variantes de la edición, donde se agregan) y "Eliminar"
 * (`products.delete_product`). Las comparten la tabla y las tarjetas.
 * Devuelve una función que arma la lista para un producto.
 *
 * @param onDelete Se llama con el producto al elegir "Eliminar".
 */
export const useProductMenuItems = ({
  onDelete,
}: {
  onDelete: (product: ProductListItem) => void;
}) => {
  const can = useCan();
  const navigate = useNavigate();

  return (product: ProductListItem): ActionsMenuItem[] => {
    const base = `/admin/products/${product.id}`;
    const items: ActionsMenuItem[] = [
      can(PERMISSIONS.products.product.change)
        ? {
            label: "Editar",
            icon: <Pencil />,
            onSelect: () => void navigate(base),
          }
        : {
            label: "Ver detalle",
            icon: <Eye />,
            onSelect: () => void navigate(base),
          },
    ];
    if (can(PERMISSIONS.products.productVariant.view)) {
      items.push({
        label: "Ver variantes",
        icon: <Layers />,
        onSelect: () => void navigate(`${base}?tab=variants`),
      });
    }
    if (can(PERMISSIONS.products.product.delete)) {
      items.push({
        label: "Eliminar",
        icon: <Trash2 />,
        onSelect: () => onDelete(product),
        variant: "danger",
      });
    }
    return items;
  };
};
