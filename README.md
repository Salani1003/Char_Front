# Char — Frontend

Aplicación web de "Char" construida con **React 19**, **TypeScript** y **Vite**.

## Requisitos

- Node.js
- **pnpm** como gestor de paquetes (el repo usa `pnpm-lock.yaml`; no usar npm/yarn)

## Puesta en marcha

```bash
pnpm install
pnpm dev
```

## Scripts disponibles

- `pnpm dev` — inicia el servidor de desarrollo de Vite
- `pnpm build` — chequea tipos (`tsc -b`) y genera el build de producción
- `pnpm lint` — corre ESLint
- `pnpm preview` — previsualiza el build de producción
- `pnpm storybook` — inicia Storybook (puerto 6006)
- `pnpm build-storybook` — genera el sitio estático de Storybook

Actualmente el repo no tiene una suite de tests configurada.

## Arquitectura

El código está organizado por dominios de funcionalidad dentro de `src/`:

- `src/admin/` — pantallas de administración (`layouts/CharAdminLayout.tsx`, `pages/<feature>/<Feature>Page.tsx`)
- `src/auth/` — pantallas de autenticación (`layouts/AuthLayout.tsx`, `pages/login/LoginPage.tsx`)
- `src/components/ui/` — primitivos generados con shadcn (button, card, ...)
- `src/lib/` — utilidades compartidas (helper `cn()` que combina `clsx` + `tailwind-merge`)

Las páginas nuevas deben seguir la convención `pages/<feature>/<Feature>Page.tsx`, y la UI compartida entre páginas de un mismo dominio va en un layout dentro de la carpeta `layouts/` correspondiente.

### Ruteo

El ruteo está centralizado en `src/app.router.tsx` usando `createBrowserRouter` de `react-router`, con dos árboles de rutas principales:

- `/admin/*` → `CharAdminLayout`, con `DashboardPage` (index), `ClientsPage` y `UsersPage` (protegidas por `ProtectedRoute`)
- `/auth/*` → `AuthLayout`, con `LoginPage` (protegida por `PublicRoute`)

Cualquier ruta no reconocida redirige a `/admin`. Los layouts (`AuthLayout`, `CharAdminLayout`) se cargan de forma diferida (lazy) vía `src/app.lazy.tsx`, y `src/main.tsx` envuelve la app en un `<Suspense>` de nivel superior.

### Autenticación

El store de auth (`src/auth/store/auth.store.ts`, Zustand persistido en `localStorage`) guarda los tokens `access`/`refresh` y el usuario actual. `src/lib/charApi.ts` es la instancia compartida de axios: adjunta el `access` token y, ante un 401, renueva la sesión una vez vía `/auth/token/refresh/` y reintenta. El backend rota el refresh token en cada renovación, por lo que se guarda el par completo (`setTokens`).

### UI / estilos

- Tailwind CSS v4 (vía `@tailwindcss/vite`, configuración en `src/index.css`, sin `tailwind.config.js`)
- shadcn/ui, configurado en `components.json`: estilo `base-nova`, color base `neutral`, íconos de `lucide-react`
- Variantes de componentes con `class-variance-authority` (`cva`); las clases se combinan con el helper `cn()` de `@/lib/utils`
- `@base-ui/react` provee primitivos sin estilos que shadcn envuelve
- El React Compiler está habilitado en `vite.config.ts`

### Datos

Para peticiones HTTP y gestión del estado del servidor se usan **Axios** y **TanStack Query** (fetching, cache, mutations y sincronización de datos).

### Documentación de componentes

Cada componente debe tener un comentario JSDoc actualizado, y Storybook se usa para documentar su comportamiento (`*.stories.tsx` colocado junto al componente).

Para más detalle sobre convenciones internas, ver [`CLAUDE.md`](./CLAUDE.md).
