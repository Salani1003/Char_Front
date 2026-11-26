import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/auth/store/auth.store";
import { Card } from "@/components/char/card";
import { PageHeader } from "@/components/char/page-header";
import { Skeleton } from "@/components/char/skeleton";
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
 * `count`; mientras carga se muestra un skeleton). Cuando haya más módulos
 * (ventas, stock, ...) se suman a la navegación y aparecen acá solos.
 */
export const DashboardPage = () => {
  useDocumentTitle("Dashboard · Char");
  const firstName = useAuthStore((state) => state.user?.first_name);
  const { data: activeUsers, isPending } = useUsers({
    page_size: 1,
    is_active: true,
  });
  const shortcuts = adminNavItems.filter((item) => !item.end);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={firstName ? `${getGreeting()}, ${firstName}` : getGreeting()}
        description="Desde acá llegás a cada parte del sistema."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map(({ to, label, icon: Icon, description }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Card className="h-full gap-4 px-(--card-spacing) transition-colors group-hover:border-primary/40 group-hover:bg-surface-hover">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <ArrowRight
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden
                />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  {label}
                </h2>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              {to === "/admin/users" ? (
                isPending ? (
                  <Skeleton className="h-4 w-28" />
                ) : activeUsers ? (
                  <p className="text-sm font-medium text-foreground">
                    {activeUsers.count}{" "}
                    {activeUsers.count === 1
                      ? "usuario activo"
                      : "usuarios activos"}
                  </p>
                ) : null
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
