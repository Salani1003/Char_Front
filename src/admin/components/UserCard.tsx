import { CalendarDays, Clock, Pencil, Trash2 } from "lucide-react";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { useAuthStore } from "@/auth/store/auth.store";
import { ActionsMenu } from "@/components/char/actions-menu";
import type { ActionsMenuItem } from "@/components/char/actions-menu";
import { Badge } from "@/components/char/badge";
import { EntityCard } from "@/components/char/entity-card";
import type { User } from "../interfaces/user.interface";
import { getUserFullName } from "../utils/getUserFullName";

const dateFormat = new Intl.DateTimeFormat("es-AR", { dateStyle: "short" });
const dateTimeFormat = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

/**
 * Tarjeta de un usuario del sistema para el listado de `UsersPage`. Adapta un
 * `User` a la `EntityCard` genérica: nombre, email, estado (activo/inactivo),
 * roles (grupos asignados), fecha de alta y último acceso. Incluye un menú de
 * tres puntitos con las opciones permitidas por `can`: "Editar"
 * (`users.change_user`) y "Desactivar" (`users.delete_user`; no aparece sobre
 * el propio usuario). Sin ninguna opción permitida no muestra el menú.
 *
 * @param user Usuario a mostrar.
 * @param roles Nombres de los grupos asignados al usuario (el backend solo
 * devuelve sus ids; la pantalla los resuelve con `useGroups`).
 * @param onEdit Se llama con el usuario al elegir "Editar".
 * @param onDelete Se llama con el usuario al elegir "Desactivar".
 */
export function UserCard({
  user,
  roles,
  onEdit,
  onDelete,
}: {
  user: User;
  roles: string[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  const fullName = getUserFullName(user);
  const can = useCan();
  const isSelf = useAuthStore((state) => state.user?.id) === user.id;
  const items: ActionsMenuItem[] = [];
  if (can(PERMISSIONS.users.change)) {
    items.push({
      label: "Editar",
      icon: <Pencil />,
      onSelect: () => onEdit(user),
    });
  }
  // Nadie puede desactivar su propio usuario.
  if (can(PERMISSIONS.users.delete) && !isSelf) {
    items.push({
      label: "Desactivar",
      icon: <Trash2 />,
      onSelect: () => onDelete(user),
      variant: "danger",
    });
  }

  return (
    <EntityCard
      title={fullName}
      subtitle={user.email}
      badge={
        <Badge variant={user.is_active ? "success" : "secondary"}>
          {user.is_active ? "Activo" : "Inactivo"}
        </Badge>
      }
      menu={
        items.length ? (
          <ActionsMenu label={`Acciones de ${fullName}`} items={items} />
        ) : undefined
      }
      details={[
        {
          label: "Roles",
          value: roles.length ? (
            <span className="flex flex-wrap justify-end gap-1">
              {roles.map((role) => (
                <Badge key={role} variant="outline">
                  {role}
                </Badge>
              ))}
            </span>
          ) : (
            "Sin roles"
          ),
        },
        {
          icon: <CalendarDays />,
          label: "Alta",
          value: dateFormat.format(new Date(user.date_joined)),
        },
        {
          icon: <Clock />,
          label: "Último acceso",
          value: user.last_login
            ? dateTimeFormat.format(new Date(user.last_login))
            : "Nunca",
        },
      ]}
    />
  );
}
