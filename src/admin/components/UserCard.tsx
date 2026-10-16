import { CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/char/badge";
import { EntityCard } from "@/components/char/entity-card";
import type { User } from "../interfaces/user.interface";

const dateFormat = new Intl.DateTimeFormat("es-AR", { dateStyle: "short" });
const dateTimeFormat = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

function getRoleLabel(user: User) {
  if (user.is_superuser) return "Superadmin";
  if (user.is_staff) return "Staff";
  return "Usuario";
}

/**
 * Tarjeta de un usuario del sistema para el listado de `UsersPage`. Adapta un
 * `User` a la `EntityCard` genérica: nombre, email, estado (activo/inactivo),
 * rol, fecha de alta y último acceso.
 *
 * @param user Usuario a mostrar.
 */
export function UserCard({ user }: { user: User }) {
  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.email;

  return (
    <EntityCard
      title={fullName}
      subtitle={user.email}
      badge={
        <Badge variant={user.is_active ? "success" : "secondary"}>
          {user.is_active ? "Activo" : "Inactivo"}
        </Badge>
      }
      details={[
        { label: "Rol", value: getRoleLabel(user) },
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
