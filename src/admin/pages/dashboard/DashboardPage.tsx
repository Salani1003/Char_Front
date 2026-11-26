import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { PERMISSIONS, useCan } from "@/auth/lib/permissions";
import { useAuthStore } from "@/auth/store/auth.store";
import { Card } from "@/components/char/card";
import { PageHeader } from "@/components/char/page-header";
import { StateMessage } from "@/components/char/state-message";
import { Skeleton } from "@/components/char/skeleton";
import { cn } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useUsers } from "../../hooks/useUsers";
import { adminNavItems } from "../../config/admin-nav";

/** Saludo según la hora local. */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Buenas noches";
  if (hour < 13) return "Buen día";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

/**
 * Pantalla de inicio del panel (`/admin`). Saluda al usuario autenticado por
 * su nombre y ofrece accesos directos a las demás pantallas del backoffice
 * (tomadas de `adminNavItems`, con su `description`), mostrando en la tarjeta
 * de Usuarios la cantidad de usuarios activos (`useUsers`, solo se lee el
 * `count`; mientras carga se muestra un skeleton). Solo muestra los módulos que el usuario puede ver (`can`); si no puede ver
 * ninguno, muestra el aviso de "sin permisos". Visualmente, el primer acceso
 * se destaca como tarjeta oscura ancha (si hay más de dos) y los demás entran
 * con una animación escalonada (respeta `prefers-reduced-motion`). Cuando haya más módulos
 * (ventas, stock, ...) se suman a la navegación y aparecen acá solos.
 */
export const DashboardPage = () => {
  useDocumentTitle("Dashboard · Char");
  const firstName = useAuthStore((state) => state.user?.first_name);
  const can = useCan();
  const canViewUsers = can(PERMISSIONS.users.view);
  const { data: activeUsers, isPending } = useUsers(
    { page_size: 1, is_active: true },
    { enabled: canViewUsers },
  );
  const shortcuts = adminNavItems.filter(
    (item) => !item.end && (!item.permission || can(item.permission)),
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={firstName ? `${getGreeting()}, ${firstName}` : getGreeting()}
        description="Desde acá llegás a cada parte del sistema."
      />
      {shortcuts.length === 0 ? (
        <StateMessage variant="empty">
          Tu usuario no tiene permisos para ver ninguna sección. Pedile acceso a
          un administrador.
        </StateMessage>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map(({ to, label, icon: Icon, description }, index) => {
          const featured = index === 0 && shortcuts.length > 2;
          return (
            <Link
              key={to}
              to={to}
              style={{ animationDelay: `${index * 60}ms` }}
              className={cn(
                "group animate-rise rounded-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                featured && "xl:col-span-2",
              )}
            >
              <Card
                className={cn(
                  "relative h-full gap-6 px-(--card-spacing) py-6 group-hover:-translate-y-0.5 group-hover:shadow-(--shadow-card-hover) motion-safe:transition-transform",
                  featured
                    ? "justify-between border-0 bg-sidebar text-sidebar-heading ring-0"
                    : "group-hover:bg-surface-card",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-px origin-left scale-x-25 bg-(--char-brand-gold) transition-transform duration-(--duration-slower) ease-(--ease-standard) group-hover:scale-x-100",
                  )}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full",
                      featured
                        ? "bg-white/10 text-(--char-brand-gold)"
                        : "bg-accent text-accent-foreground",
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <ArrowRight
                    className={cn(
                      "size-4 transition-transform duration-(--duration-base) group-hover:translate-x-1",
                      featured
                        ? "text-sidebar-idle group-hover:text-(--char-brand-gold)"
                        : "text-muted-foreground group-hover:text-primary",
                    )}
                    aria-hidden
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h2
                    className={cn(
                      "font-display font-medium tracking-tight",
                      featured
                        ? "text-3xl text-sidebar-heading"
                        : "text-xl text-foreground",
                    )}
                  >
                    {label}
                  </h2>
                  <p
                    className={cn(
                      "text-sm",
                      featured ? "text-sidebar-idle" : "text-muted-foreground",
                    )}
                  >
                    {description}
                  </p>
                </div>
                {to === "/admin/users" ? (
                  isPending ? (
                    <Skeleton className="h-4 w-28" />
                  ) : activeUsers ? (
                    <p
                      className={cn(
                        "text-sm font-medium",
                        featured ? "text-sidebar-heading" : "text-foreground",
                      )}
                    >
                      {activeUsers.count}{" "}
                      {activeUsers.count === 1
                        ? "usuario activo"
                        : "usuarios activos"}
                    </p>
                  ) : null
                ) : null}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
