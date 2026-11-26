import { Suspense } from "react";
import { Outlet } from "react-router";
/**
 * Marco compartido por todas las pantallas de autenticación (login, recuperar
 * contraseña, etc.). En desktop muestra un panel de marca oscuro a la izquierda
 * (logo + wordmark "Char Tienda" en Montserrat con la leyenda "GESTIÓN COMERCIAL")
 * y centra el contenido de la ruta (`Outlet`) a la derecha; por debajo de 900px
 * el panel de marca se oculta y el mismo bloque de logo + wordmark se muestra
 * compacto sobre el contenido. La pantalla se carga lazy, así que el `Outlet`
 * va dentro de un `Suspense`.
 */
const AuthLayout = () => {
  return (
    <div className="grid min-h-screen w-full bg-surface-app text-foreground md:grid-cols-2">
      <div className="hidden flex-col justify-between gap-10 bg-surface-sidebar px-9 py-14 md:flex">
        <div className="flex items-center gap-4">
          <img
            src="/logo/char-logo.jpg"
            alt="Char"
            className="h-16 w-16 rounded-full"
          />
          <div>
            <p className="font-display text-4xl font-medium tracking-wide text-sidebar-heading">
              Char Tienda
            </p>
            <p className="font-sans text-sm tracking-[0.3em] text-(--char-brand-gold)/80">
              GESTIÓN COMERCIAL
            </p>
          </div>
        </div>
        <div>
          <h1 className="mb-3.5 text-nowrap font-display text-4xl leading-snug font-semibold text-sidebar-heading">
            Tu negocio, ordenado.
          </h1>
          <p className="max-w-[44ch] text-base leading-relaxed text-sidebar-idle">
            Clientes, proveedores, productos, ventas y stock
            <br />
            de Char en un solo lugar.
          </p>
        </div>
        <p className="text-xs text-sidebar-idle">
          © {new Date().getFullYear()} Char Tienda
        </p>
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-5 py-12 md:px-9">
        <div className="flex items-center gap-4 md:hidden">
          <img
            src="/logo/char-logo.jpg"
            alt="Char"
            className="h-16 w-16 rounded-full"
          />
          <div>
            <p className="font-display text-2xl font-medium tracking-wide text-foreground">
              Char Tienda
            </p>
            <p className="font-sans text-xs tracking-[0.2em] text-sidebar-idle">
              GESTIÓN COMERCIAL
            </p>
          </div>
        </div>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};
export default AuthLayout;
