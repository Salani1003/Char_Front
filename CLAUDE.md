# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (repo has `pnpm-lock.yaml` — don't use npm/yarn).

- `pnpm dev` — start Vite dev server
- `pnpm build` — typecheck (`tsc -b`) then production build
- `pnpm lint` — run ESLint
- `pnpm preview` — preview the production build
- `pnpm storybook` — run Storybook dev server (port 6006)
- `pnpm build-storybook` — build the static Storybook site

There is no test setup in this repo yet.

## Architecture

This is a React 19 + TypeScript + Vite app for "Char", split into feature domains under `src/`:

- `src/admin/` — admin screens (`layouts/CharAdminLayout.tsx`, `pages/<feature>/<Feature>Page.tsx`)
- `src/auth/` — auth screens (`layouts/AuthLayout.tsx`, `pages/login/LoginPage.tsx`)
- `src/components/ui/` — shadcn/base-ui primitives (button, input, label, card, ...). Screens must not import from here directly — see Component architecture below.
- `src/components/char/` — Char's own Design System components (own API/variants/identity), wrapping `components/ui` primitives. Screens import from here.
- `src/components/forms/` — react-hook-form integration layer (`FormInput`, `FormPasswordInput`, `FormTextarea`, `FormSwitch`, `FormCheckboxGroup`, `FormSelect`), built on top of `components/char`.
- `src/styles/tokens.css` — Char design tokens (color, radius, spacing, typography, elevation, motion), imported by `src/index.css` and bridged into Tailwind utilities via `@theme inline`.
- `src/lib/` — shared utilities (`cn()` helper combining `clsx` + `tailwind-merge`; `apiError.ts` normalizes DRF errors — including nested ones, flattened to dotted keys — into `ApiError`, and `applyApiErrors.ts` maps them onto a react-hook-form)
- `src/hooks/` — shared hooks (`useDebounce`, `useDocumentTitle` to set the tab title per screen)
- `src/references/` — a reference Char UI kit (design tokens, atoms/molecules/organisms/templates as `.jsx` + `.prompt.md`) used as the source of truth for the brand's visual identity. Not wired into the app — consult it when porting a new component into `components/char`, don't import from it directly.
- `src/design-system/` — the `/design-system` route: a live, interactive catalog of every token in `tokens.css`/`index.css` and every `components/char` component. Reads token values at runtime via `getComputedStyle` (`src/design-system/lib/cssTokens.ts`) instead of duplicating them — when adding a new token or a new `components/char` component, add it here too so the catalog stays complete.

New feature pages should follow the existing `pages/<feature>/<Feature>Page.tsx` convention, and shared cross-page UI belongs in a layout under the relevant domain's `layouts/` folder.

### Component architecture

Char follows a layered component architecture (loosely Atomic Design, no strict enforcement):

```
components/ui (shadcn/base-ui primitive)
  → components/char (Char's own component: API, variants, identity)
    → components/forms (react-hook-form integration, when the component is used in a form)
      → screen
```

- Never import from `components/ui` in a screen — import the `components/char` equivalent instead (e.g. `@/components/char/button`, not `@/components/ui/button`). This keeps screens decoupled from the shadcn/base-ui primitives so the underlying primitive can change without touching every screen.
- Only create a new `components/char/*` component when it needs its own API, variant set, or visual identity beyond what the primitive exposes — don't create one just to re-export the primitive unchanged (though a thin re-export is fine when the goal is decoupling screens from `components/ui`, see `components/char/card.tsx`).
- `components/char/*` components expose a simple, semantic API (e.g. `variant="primary"`) — never raw style props (colors, hover colors, etc.). Variants are implemented internally using the design tokens.
- `components/forms/*` components own the react-hook-form wiring (`useController`/`useFormContext`) and stay separate from `components/char` (which must stay agnostic of any form library).
- Never hardcode colors (hex/oklch/`bg-[#...]`) on a screen or component — use a Tailwind utility backed by a token (`bg-primary`, `text-danger`, `rounded-card`, ...) from `src/styles/tokens.css`. To change the palette, edit `tokens.css` (and its Tailwind bridge in `index.css`) only.

### Routing

Routing is centralized in `src/app.router.tsx` using `react-router`'s `createBrowserRouter`, with two top-level route trees:

- `/admin/*` → `CharAdminLayout`, containing `DashboardPage` (index), `ClientsPage` and `UsersPage` (all behind `ProtectedRoute`)
- `/auth/*` → `AuthLayout`, containing `LoginPage` (behind `PublicRoute`)
- `/design-system` → `DesignSystemPage` (no layout), the Design System catalog described above

Every top-level route tree has `errorElement: <RouteErrorPage />` (`src/error/pages/`), shown when a screen throws or a lazy chunk fails to load.

Any unmatched route redirects to `/admin`. Route layouts (`AuthLayout`, `CharAdminLayout`) **and screens** (`LoginPage`, `DashboardPage`, `ClientsPage`, `UsersPage`, `DesignSystemPage`) are lazy-loaded via `src/app.lazy.tsx` (`React.lazy`; screens keep their named export and are re-exported as `default` there). Both layouts wrap their `Outlet` in a `<Suspense>` (admin: `fallback={<PageSkeleton />}`) so navigating between screens doesn't unmount the frame, and `src/main.tsx` wraps the app in a top-level `<Suspense>`. When adding a new layout, register its lazy import in `app.lazy.tsx` rather than importing it directly in the router.

`src/CharApp.tsx` just renders `<RouterProvider router={appRouter} />` and is mounted from `src/main.tsx`.

### UI / styling

- Tailwind CSS v4 (via `@tailwindcss/vite`, config lives in `src/index.css` + `src/styles/tokens.css`, no `tailwind.config.js`)
- shadcn/ui, configured via `components.json`: style `base-nova`, base color `neutral`, icon library `lucide-react`, no RSC. Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`.
- Component variants use `class-variance-authority` (`cva`); merge classes with the `cn()` helper from `@/lib/utils`, never string-concat Tailwind classes.
- `@base-ui/react` provides unstyled primitives that shadcn components wrap (see `src/components/ui/button.tsx` for the pattern: primitive + `cva` variants + `cn`).
- Path alias `@/*` → `src/*` is defined in both `tsconfig.app.json` and `vite.config.ts` — keep them in sync if changed.
- The React Compiler (babel plugin, via `@rolldown/plugin-babel`) is enabled in `vite.config.ts` — avoid manual `useMemo`/`useCallback` micro-optimizations that fight the compiler.

Some comments in the codebase (e.g. layout files) are written in Spanish; match existing conventions for consistency.

### Data fetching

- **Axios** for HTTP requests and **TanStack Query** (`@tanstack/react-query`) for server-state management: fetching, caching, mutations, and data synchronization. Do not reimplement these responsibilities manually with `fetch`, `useEffect`, or ad-hoc state when TanStack Query can handle it.

### Auth / session

`src/auth/store/auth.store.ts` (Zustand, persisted in `localStorage` as `auth-storage`) holds `access`/`refresh` tokens and the current user. `logout()` is async: it calls `POST /auth/logout/` (blacklists the refresh token, best-effort) and then clears the local session; `clearSession()` only clears the local session and is what the axios interceptor uses when the refresh fails. `src/lib/charApi.ts` is the shared axios instance: it attaches the `access` token and, on a 401 (except from `/auth/token/` and `/auth/token/refresh/`), refreshes once via `/auth/token/refresh/` and retries. The backend rotates and blacklists the refresh token on every refresh, so the new `refresh` returned must always be stored too (`setTokens(access, refresh)`) — saving only `access` logs the user out on the second renewal. The persisted session is validated once per page load: `ProtectedRoute` calls `verifySession()` (`GET /users/me/`) while `sessionVerified` (not persisted) is `false` and shows `AdminLayoutSkeleton` (a skeleton of the whole frame); a rejected session is cleared, an offline one is kept.

`src/lib/queryClient.ts` holds the shared `QueryClient`: no retries on 4xx (only network/5xx, max 2) and `staleTime` of 30 s.

### Permissions

Access control has a single mechanism (`src/auth/lib/permissions.ts`): `can(permission)` is true if `user.is_superuser` **or** `user.permissions` (from `GET /users/me/`, stored in `useAuthStore`) includes it. Never decide by role/group name (`group_names`/`groups` are informational) and never repeat the superuser logic in a component. Use `useCan()` in components (reactive), `<Can permission>` (`auth/components/Can.tsx`) to show/hide buttons and sections, and `RequirePermission` (`auth/components/RequirePermission.tsx`) on routes: without the module's "view" permission it shows a "Usted no posee permisos" alert and redirects to `/admin`. Permission strings live in `PERMISSIONS`. `adminNavItems` declare a `permission` and the sidebar, `AdminSearch` and the Dashboard only list modules the user can view (no permissions at all → the Dashboard shows the "sin permisos" message). `useGroups` only calls `/groups/` with `auth.view_group` (the groups selector in `UserFormDialog` is hidden otherwise; non-superusers can only assign groups they have, `useCanAssignGroup`). Nobody can deactivate themselves (`UserCard`). Permissions are re-requested (`refreshUser`) on reload, when the tab becomes visible (`ProtectedRoute`) and on any 403 (`charApi` interceptor); the 403 from the backend is the source of truth (`toApiError` shows its message or "No tenés permiso para esta acción").

### Listings

Paginated listings (DRF `PageNumberPagination`, typed with `admin/interfaces/paginated.interface.ts` → `Paginated<T>`) keep `page`/`pageSize` in the screen state, pass them to the action and the `queryKey`, use `placeholderData: keepPreviousData` and go back to page 1 when the search, a filter or the page size changes (keep the page together with the criteria it was chosen for, as `UsersPage` does, so no request is sent with stale criteria). Render `components/char/pagination` below the list and cover the states with `components/char/state-message` (`error` with "Reintentar" / `empty`) and a skeleton (`components/char/skeleton`; e.g. `UsersListSkeleton`) for loading — prefer skeletons over spinners/"Cargando…" texts; dim the list while `isPlaceholderData`. See `admin/pages/users/UsersPage.tsx`. Searching is always `components/char/search-bar` (search field only) with the filters passed as `actions={<FiltersPopover … />}` (`components/char/filters-popover`, config-driven: chips, select, multiselect, text, date, checkbox; `multiselect` stores its options comma-separated, see `parseMultiValue`/`joinMultiValue`). `SearchBar` no longer has a collapsible "Más filtros" section — don't build filters by hand inside it.

Tabular listings use `components/char/data-table` (`DataTable`: sortable headers via DRF `ordering`, skeleton rows via `loading`, horizontal scroll under `--table-min-width`) instead of cards. `admin/pages/clients/ClientsPage.tsx` is the reference: on phones (below `md`) it shows cards (`ClientsCardList` → `ClientCard`, built on `EntityCard`, with an "Ordenar por" select + direction button since cards have no sortable headers) instead of the table — both are rendered and CSS (`max-md:hidden` / `md:hidden`) picks one; the row menu is shared via `useClientMenuItems`. It keeps search, filters, ordering, `page` and `page_size` **in the URL** (`admin/hooks/useClientsSearchParams.ts`, valid values only, defaults omitted) so the screen can be shared/reloaded; any criteria change goes back to page 1. Soft-deleted rows disappear from the cache immediately (`useDeleteClient`) and the toast offers "Deshacer" (`POST /clients/:id/restore/`, `clients.change_client`). `toApiError` turns a 429 into "Hiciste demasiadas solicitudes seguidas…".

Admin navigation lives in `src/admin/config/admin-nav.ts` (single source for the sidebar and the header search `AdminSearch`). Toasts (`toast` from `@/components/char/sonner`) are tinted per type (`success`/`warning`/`error`/`info`) with the role tokens.

### Conventions

- Every component must have a JSDoc comment above its definition, and that JSDoc must be kept up to date whenever the component's props or behavior change.
- Storybook is installed (`.storybook/main.ts`) and used to describe/document component behavior. Config: `@storybook/react-vite` framework, addons `@chromatic-com/storybook`, `@storybook/addon-a11y`, `@storybook/addon-docs`. Stories are picked up from `src/**/*.stories.@(js|jsx|mjs|ts|tsx)` and `src/**/*.mdx` — colocate a `*.stories.tsx` next to any component that needs one. No example stories are left in the repo (the default `src/stories/` scaffold was removed). The vitest/playwright interaction-testing addon and `@storybook/addon-mcp` were deliberately left out — both pull in vitest/Playwright/Chromium as (transitive/peer) deps, which isn't needed just to document behavior.
- Respond to the user in Spanish when working in this repository.
- After creating or modifying files, always run Prettier and ESLint on them: `npx prettier --write <files>` then `npx eslint --fix <files>`, and make sure `npx eslint <files>` is clean. A `PostToolUse` hook in `.claude/settings.json` already does this automatically for files written with the Write/Edit tools; files changed through Bash (scripts, `sed`, heredocs) are not covered, so run both commands manually after those. Order matters: Prettier first, then ESLint's `--fix`. `eslint.config.js` allows a single blank line between statements (`no-multiple-empty-lines` with `max: 1`, same as Prettier's output) but not blank lines at the start/end of a file or block (`padded-blocks: never`).
- Whenever code changes, update the affected JSDoc comments, the READMEs and the `CLAUDE.md` files in the same change if they describe it.
