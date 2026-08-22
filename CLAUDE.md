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
- `src/components/ui/` — shadcn-generated primitives (button, card, ...)
- `src/lib/` — shared utilities (`cn()` helper combining `clsx` + `tailwind-merge`)

New feature pages should follow the existing `pages/<feature>/<Feature>Page.tsx` convention, and shared cross-page UI belongs in a layout under the relevant domain's `layouts/` folder.

### Routing

Routing is centralized in `src/app.router.tsx` using `react-router`'s `createBrowserRouter`, with two top-level route trees:
- `/admin/*` → `CharAdminLayout`, containing `DashboardPage` (index) and `ClientsPage`
- `/auth/*` → `AuthLayout`, containing `LoginPage`

Any unmatched route redirects to `/admin`. Route layouts (`AuthLayout`, `CharAdminLayout`) are lazy-loaded via `src/app.lazy.tsx` (`React.lazy`), and `src/main.tsx` wraps the app in a top-level `<Suspense>`. When adding a new layout, register its lazy import in `app.lazy.tsx` rather than importing it directly in the router.

`src/CharApp.tsx` just renders `<RouterProvider router={appRouter} />` and is mounted from `src/main.tsx`.

### UI / styling

- Tailwind CSS v4 (via `@tailwindcss/vite`, config lives in `src/index.css`, no `tailwind.config.js`)
- shadcn/ui, configured via `components.json`: style `base-nova`, base color `neutral`, icon library `lucide-react`, no RSC. Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`.
- Component variants use `class-variance-authority` (`cva`); merge classes with the `cn()` helper from `@/lib/utils`, never string-concat Tailwind classes.
- `@base-ui/react` provides unstyled primitives that shadcn components wrap (see `src/components/ui/button.tsx` for the pattern: primitive + `cva` variants + `cn`).
- Path alias `@/*` → `src/*` is defined in both `tsconfig.app.json` and `vite.config.ts` — keep them in sync if changed.
- The React Compiler (babel plugin, via `@rolldown/plugin-babel`) is enabled in `vite.config.ts` — avoid manual `useMemo`/`useCallback` micro-optimizations that fight the compiler.

Some comments in the codebase (e.g. layout files) are written in Spanish; match existing conventions for consistency.

### Data fetching

- **Axios** for HTTP requests and **TanStack Query** (`@tanstack/react-query`) for server-state management: fetching, caching, mutations, and data synchronization. Do not reimplement these responsibilities manually with `fetch`, `useEffect`, or ad-hoc state when TanStack Query can handle it.

### Conventions

- Every component must have a JSDoc comment above its definition, and that JSDoc must be kept up to date whenever the component's props or behavior change.
- Storybook is installed (`.storybook/main.ts`) and used to describe/document component behavior. Config: `@storybook/react-vite` framework, addons `@chromatic-com/storybook`, `@storybook/addon-a11y`, `@storybook/addon-docs`. Stories are picked up from `src/**/*.stories.@(js|jsx|mjs|ts|tsx)` and `src/**/*.mdx` — colocate a `*.stories.tsx` next to any component that needs one. No example stories are left in the repo (the default `src/stories/` scaffold was removed). The vitest/playwright interaction-testing addon and `@storybook/addon-mcp` were deliberately left out — both pull in vitest/Playwright/Chromium as (transitive/peer) deps, which isn't needed just to document behavior.
- Respond to the user in Spanish when working in this repository.
