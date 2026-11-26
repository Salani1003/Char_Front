import { CalendarDays, Clock, Mail, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog } from "@/components/char/dialog";
import type { User } from "../interfaces/user.interface";

/** Fecha larga en español (`26 de noviembre de 2026`), o "—" si no hay. */
const formatDate = (value: Date | string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

/**
 * Modal "Mi información" del menú de usuario del backoffice: muestra los
 * datos de la cuenta autenticada en modo lectura — nombre y apellido, correo,
 * fecha de alta y último acceso. Es controlado: el layout guarda `open`.
 *
 * @param open Si el modal está visible.
 * @param onOpenChange Se llama con el nuevo estado cuando se abre o cierra.
 * @param user Usuario autenticado (`useAuthStore().user`); sin usuario no
 * muestra datos.
 */
export function UserInfoDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
}) {
  const details: { label: string; value: ReactNode; icon: ReactNode }[] = [
    {
      label: "Nombre y apellido",
      value: user ? `${user.first_name} ${user.last_name}`.trim() || "—" : "—",
      icon: <UserRound />,
    },
    { label: "Correo", value: user?.email ?? "—", icon: <Mail /> },
    {
      label: "Miembro desde",
      value: formatDate(user?.date_joined),
      icon: <CalendarDays />,
    },
    {
      label: "Último acceso",
      value: formatDate(user?.last_login),
      icon: <Clock />,
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Mi información"
      description="Los datos de tu cuenta."
    >
      <dl className="divide-y divide-border">
        {details.map(({ label, value, icon }) => (
          <div key={label} className="flex items-center gap-3 py-3">
            <span className="text-muted-foreground [&_svg]:size-4" aria-hidden>
              {icon}
            </span>
            <dt className="w-36 shrink-0 text-sm text-muted-foreground">
              {label}
            </dt>
            <dd className="min-w-0 flex-1 truncate text-right text-sm font-medium text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}
