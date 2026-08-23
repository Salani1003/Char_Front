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
- `src/components/forms/` — react-hook-form integration layer (`FormInput`, `FormPasswordInput`, ...), built on top of `components/char`.
- `src/styles/tokens.css` — Char design tokens (color, radius, spacing, typography, elevation, motion), imported by `src/index.css` and bridged into Tailwind utilities via `@theme inline`.
- `src/lib/` — shared utilities (`cn()` helper combining `clsx` + `tailwind-merge`)
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

- `/admin/*` → `CharAdminLayout`, containing `DashboardPage` (index) and `ClientsPage`
- `/auth/*` → `AuthLayout`, containing `LoginPage`
- `/design-system` → `DesignSystemPage` (no layout), the Design System catalog described above

Any unmatched route redirects to `/admin`. Route layouts (`AuthLayout`, `CharAdminLayout`) are lazy-loaded via `src/app.lazy.tsx` (`React.lazy`), and `src/main.tsx` wraps the app in a top-level `<Suspense>`. When adding a new layout, register its lazy import in `app.lazy.tsx` rather than importing it directly in the router.

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

### Conventions

- Every component must have a JSDoc comment above its definition, and that JSDoc must be kept up to date whenever the component's props or behavior change.
- Storybook is installed (`.storybook/main.ts`) and used to describe/document component behavior. Config: `@storybook/react-vite` framework, addons `@chromatic-com/storybook`, `@storybook/addon-a11y`, `@storybook/addon-docs`. Stories are picked up from `src/**/*.stories.@(js|jsx|mjs|ts|tsx)` and `src/**/*.mdx` — colocate a `*.stories.tsx` next to any component that needs one. No example stories are left in the repo (the default `src/stories/` scaffold was removed). The vitest/playwright interaction-testing addon and `@storybook/addon-mcp` were deliberately left out — both pull in vitest/Playwright/Chromium as (transitive/peer) deps, which isn't needed just to document behavior.
- Respond to the user in Spanish when working in this repository.
