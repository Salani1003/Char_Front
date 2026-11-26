import { useAuthStore } from "../store/auth.store";
import type { CurrentUser } from "@/admin/interfaces/user.interface";

/** Arma las cuatro cadenas `<app>.<accion>_<modelo>` de un modelo. */
const crud = <A extends string, M extends string>(app: A, model: M) =>
  ({
    view: `${app}.view_${model}`,
    add: `${app}.add_${model}`,
    change: `${app}.change_${model}`,
    delete: `${app}.delete_${model}`,
  }) as const;

/**
 * Permisos de Django (`<app>.<accion>_<modelo>`) que usa el front. Es el único
 * lugar donde se escriben: el resto del código los referencia desde acá.
 */
export const PERMISSIONS = {
  clients: {
    view: "clients.view_client",
    add: "clients.add_client",
    change: "clients.change_client",
    delete: "clients.delete_client",
  },
  users: {
    view: "users.view_user",
    add: "users.add_user",
    change: "users.change_user",
    delete: "users.delete_user",
  },
  products: {
    category: crud("products", "category"),
    brand: crud("products", "brand"),
    productModel: crud("products", "productmodel"),
    color: crud("products", "color"),
    size: crud("products", "size"),
    product: crud("products", "product"),
    productVariant: crud("products", "productvariant"),
    /** Ver y editar el precio de costo de un producto. */
    costPrice: "products.view_cost_price",
  },
  groups: {
    view: "auth.view_group",
  },
} as const;

/** Única implementación de la regla: superusuario o permiso en la lista. */
const check = (user: CurrentUser | undefined, permission: string) =>
  !!user && (user.is_superuser || user.permissions.includes(permission));

/**
 * Helper único de control de acceso. `true` si el usuario autenticado es
 * superusuario (acceso a todo, sin mirar `permissions`) o si su lista
 * `permissions` incluye `permission`. Nunca se decide por el nombre del rol.
 * Lee el store en el momento de llamarla (no re-renderiza): dentro de
 * componentes usar `useCan`, `<Can>` o `RequirePermission`.
 */
export const can = (permission: string) =>
  check(useAuthStore.getState().user, permission);

/**
 * Versión reactiva de `can` para componentes: devuelve una función
 * `can(permission)` y el componente se vuelve a renderizar cuando cambia el
 * usuario (por ejemplo al renovar los permisos con `/users/me/`).
 */
export const useCan = () => {
  const user = useAuthStore((state) => state.user);
  return (permission: string) => check(user, permission);
};

/**
 * Un superusuario puede asignar cualquier grupo; el resto, solo los grupos que
 * él mismo tiene. El backend sigue siendo la fuente de verdad (400/403).
 */
export const useCanAssignGroup = () => {
  const user = useAuthStore((state) => state.user);
  return (groupId: number) =>
    !!user && (user.is_superuser || user.groups.includes(groupId));
};
