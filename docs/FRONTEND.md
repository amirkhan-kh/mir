# Frontend

Next.js 16 App Router + TS + Tailwind v4. UI copy is **Uzbek (Latin)**. Read `frontend/AGENTS.md`: Next 16 has breaking changes — check `frontend/node_modules/next/dist/docs/` before using an API you remember from older Next (e.g. middleware is now `src/proxy.ts`).

```
frontend/src/
  app/                    thin routes: metadata + one feature component. Public: (shop)/ — /, /katalog, /mahsulot/[slug], /savat, /rasmiylashtirish, /buyurtma/[number], /kuzatish, /sevimlilar; /login. Private: /admin/**
  features/<domain>/      screens, forms, modals (client components where interactive)
  features/storefront/    Header, MobileTabBar, Footer, ProductCard/ProductGrid, HeroCarousel, home sections
  features/catalog|product|cart|checkout/   catalog filters, product page (gallery, BuyBox, reviews), cart store, checkout + tracking
  features/admin/         AdminShell (sidebar nav, role filter, logout) + one folder per admin screen
  shared/ui/              Button, Field (Input/Select/Textarea/Checkbox), Modal, Page (PageHeader, Card, KpiCard, SearchInput, Chips, Pagination, Table), Badge, States, Logo, Stars, CategoryIcon
  shared/lib/             api (fetch /api/v1, 401 on /admin → /login), server (serverGet), useApi, usePaged (q debounce 300ms, status, page, limit 15), format, status, local-store
  proxy.ts                guards /admin/* by mir_token cookie
```

## Patterns to copy

- List screen = `PageHeader` (title + primary action) → `Chips` (status) + `SearchInput` → `Table` → `Pagination`, data via `usePaged("/domain")`.
- Create/edit = `Modal` + `<form onSubmit>` with `Field label="…"` inputs, `required`/`min`/`max` attributes, submit `Button disabled={saving}`, error text from `ApiError.message`.
- Detail screen = `/admin/<domain>/[id]` → `features/admin/<domain>/<Domain>Detail.tsx`, back link to the list.
- Destructive / irreversible action = `confirm("…?")` before the call.
- Every async view handles **loading · empty · error** via `shared/ui/States`.

## Rules

- Server components by default; `"use client"` only for interactive leaves.
- One UI kit (`shared/ui`). No new component library. Icons: `lucide-react`. Charts: `recharts`. Motion: `motion` (respect `prefers-reduced-motion`).
- **Testability = accessibility**: every input has a visible `Field label` or `aria-label`; icon-only buttons have `aria-label`; toggles use `aria-pressed`; dialogs have a title. Tests select by role/label, so missing labels are bugs.
- Formatting only via `shared/lib/format` (money `so'm`, dates). Status labels/colors only via `shared/lib/status`.
- Public pages (`/`, `/login`): `metadata` (title, description, canonical, OG), `next/image`, `next/font`, no CLS → Lighthouse 100 (`docs/skills/03-lighthouse.md`).
- Contrast ≥ 4.5:1, focus visible, keyboard reachable (Tab / Enter / Esc closes Modal).
- No Next ↔ other framework swap. No client-side data lib (SWR/React Query) — `useApi` is the one.

## UI change checklist

- [ ] Loading, empty, error states render.
- [ ] Labels / aria-labels on every new control.
- [ ] Mobile (375px) and desktop (1280px) layouts.
- [ ] New controls added to the matrix in `docs/TESTING.md`.
