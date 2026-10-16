// El diseño que tengan todas las pantallas de administracion
import { useState, type ComponentProps } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Users,
  UserCog,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/auth/store/auth.store";
import { Input } from "@/components/char/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/char/tooltip";
const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/clients", label: "Clientes", icon: Users, end: false },
  { to: "/admin/users", label: "Usuarios", icon: UserCog, end: false },
];
/**
 * Marco compartido por todas las pantallas de administración (dashboard,
 * clientes, usuarios, etc.). Muestra la navegación primaria de Char en un
 * panel oscuro (`Sidebar`) — logo + wordmark "Char Tienda" y los enlaces de
 * `NAV_ITEMS`, resaltando el activo con el estilo del kit de referencia
 * (franja + fondo en tinte accent) — y una barra superior (`Header`) con
 * buscador, notificaciones, el usuario autenticado y la acción de cerrar
 * sesión, dejando el contenido de la ruta activa (`Outlet`) en el área
 * principal.
 *
 * En desktop/tablet el panel es colapsable a un modo "rail" (solo iconos,
 * con tooltip al pasar el mouse) mediante el botón en la esquina superior
 * derecha del encabezado del panel (ícono de menú/hamburguesa para
 * colapsar, de flecha para expandir); el estado se anima con una
 * transición de ancho suave. Por debajo de 900px el panel se comporta
 * como un drawer off-canvas: se oculta detrás de un botón de menú en el
 * header y se abre superpuesto sobre el contenido, siempre expandido.
 */
const CharAdminLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };
  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "";
  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const roleLabel = user?.is_superuser ? "Administrador" : "Usuario";
  return (
    <div className="flex min-h-screen w-full bg-surface-app text-foreground">
      {mobileNavOpen ? (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-(--overlay-scrim-strong) md:hidden"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-(--sidebar-width-mobile) flex-col gap-8 overflow-x-hidden bg-sidebar px-6 py-8 shadow-(--shadow-nav-mobile) transition-transform duration-(--duration-base) ease-(--ease-standard) md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 md:shadow-none md:transition-[width,padding] md:duration-(--duration-base) md:ease-(--ease-standard)",
          collapsed
            ? "md:w-(--sidebar-width-rail) md:px-3"
            : "md:w-(--sidebar-width)",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/logo/char-logo.jpg"
              alt="Char"
              className={cn(
                "h-14 w-14 shrink-0 rounded-full transition-[width,height] duration-(--duration-base) ease-(--ease-standard)",
                collapsed && "md:h-10 md:w-10",
              )}
            />
            <div className={cn("min-w-0", collapsed && "md:hidden")}>
              <p className="truncate font-montserrat text-2xl leading-tight font-semibold text-sidebar-heading">
                Char Tienda
              </p>
              <p className="truncate font-sans text-xs tracking-[0.2em] text-sidebar-idle">
                GESTIÓN COMERCIAL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Cerrar menú"
            className="shrink-0 text-sidebar-idle md:hidden"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            className="hidden shrink-0 items-center justify-center rounded-md border border-sidebar-border text-sidebar-idle transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:flex md:size-8"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-nav-item border-l-[3px] px-3.5 py-3.5 text-base font-medium transition-colors",
                  collapsed && "md:justify-center md:px-2",
                  isActive
                    ? "border-primary bg-accent text-sidebar-accent-foreground"
                    : "border-transparent text-sidebar-idle hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )
              }
            >
              <Tooltip>
                <TooltipTrigger
                  disabled={!collapsed}
                  delay={200}
                  render={(triggerProps) => (
                    <span
                      {...(triggerProps as ComponentProps<"span">)}
                      className="flex shrink-0 items-center justify-center"
                    >
                      <Icon className="size-6 shrink-0" />
                    </span>
                  )}
                />
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
              <span className={cn("truncate", collapsed && "md:sr-only")}>
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-5 md:h-(--header-height)">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menú"
            className="text-muted-foreground md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1 md:max-w-sm">
            <Input
              icon={<Search className="size-4" />}
              placeholder="Buscar..."
              aria-label="Buscar"
            />
          </div>
          <div className="hidden flex-1 md:block" />
          <div className="flex items-center gap-3 md:gap-5">
            <button
              type="button"
              aria-label="Notificaciones"
              className="relative text-muted-foreground transition-colors hover:text-foreground"
            >
              <Bell className="size-5" />
              <span className="absolute -top-0.5 right-0 size-2 rounded-full border-[1.5px] border-card bg-primary" />
            </button>
            <div className="hidden h-6 w-px bg-border md:block" />
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar font-display text-sm font-semibold text-sidebar-heading">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm leading-tight font-semibold text-foreground">
                  {fullName}
                </p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="text-muted-foreground transition-colors hover:text-danger"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default CharAdminLayout;
