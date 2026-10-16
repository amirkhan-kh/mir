# TASKS

`[ ]` todo · `[~]` doing (one only) · `[x]` done + verified · `[!]` blocked + reason · 1 session = 1 line · handoff format in `docs/ORCHESTRATION.md`

- [x] 0.1 Lock `STACK.md` (next + express + postgres).
- [x] 1.1 Backend: auth, categories, products, banners, orders (quote, create, status machine, courier assign, tracking), reviews, users, settings, uploads, dashboard.
- [x] 1.2 Frontend storefront (uz, uzum-style): home (hero + promo banners, category tiles, rails), catalog + filters, product page (gallery, installment tabs, reviews), cart, favorites, checkout, order page, tracking.
- [x] 1.3 Admin `/admin`: dashboard, orders, products (+ image upload, specs, preview), categories, banners, reviews, staff, settings.
- [x] 1.4 Docker Compose local run, seed admin/admin123 + demo data (manager, courier1..2, 28 products, 26 orders).
  - handoff: ports UI 3010, API 4010, DB 5440 (others busy on this machine). API smoke green (idempotency, stock 409, courier 403, cancel restores stock); all public + admin pages 200; typecheck green both packages. TV / fridge / washer / AC categories seeded inactive — no images yet.
- [x] 1.5 Header no longer sticky (sidebar offsets `top-40` → `top-6`); product card without padding, edge-to-edge image, compact info block (price + old price on one row).
- [ ] 2.1 Real product photos + activate TV, fridge, washing machine, AC categories.
- [ ] 2.2 Telegram notification to staff on new order.
- [ ] 2.3 Online payment (Payme / Click) for card checkout.
- [ ] 3.1 Lighthouse 100 on `/`, `/mahsulot/[slug]`, `/login`.
- [x] 3.2 Named tests (checkout stock decrement, cancel restore, idempotency) — `frontend/e2e/api.spec.ts` against the real backend (`npm run test:e2e:backend`), plus price snapshot, state machine, 401/403/422/429 rows.
- [ ] 3.3 Deploy (VPS) — remove default admin, HTTPS. Vercel Services config ready (root `vercel.json`: frontend + backend, `BACKEND_URL` binding, Blob uploads); managed PostgreSQL + Blob store + live deploy still open.
- [x] 3.4a E2E setup: Playwright config (mock + backend stacks), fixtures (console/5xx guard, catalog, shopper, unique), factories, global-setup + `AUTH-*` and `G-01/03` rows. Run: `npm run test:e2e` (mock) / `npm run test:e2e:backend` (real API; raise `CHECKOUT_RATE_LIMIT` in compose).
- [~] 3.4b E2E P0 shop: `CART-*`, `CHK-*`, `TRK-*` done (mock + backend, 3 repeats, 0 flaky); `ORD-*` admin UI rows still open.
- [ ] 3.4c E2E P1: `SHOP-*`, `PDP-*`, `PRD-*`, `CAT-*`, `BNR-*`, `DSH-*` + their `L*` rows.
- [ ] 3.4d E2E P2: `REV-*`, `STF-*`, `SET-*`.
- [ ] 3.4e API rows: `API-AUTH`, `API-<MOD>` for every mutating route + invariant break attempts.
- [x] 4.1 i18n core (no new package): `ru` (default) + `ky`, Uzbek removed. `mir_lang` cookie → `getT()`/`getLang()` (server, `shared/i18n/server.ts`) and `LangProvider`/`useT()` (client); `<html lang>`, OG locale; RU/KY switcher in header, admin sidebar and login. URL slugs stay as before.
- [x] 4.2 DB content in two languages: migration `002_i18n.sql` adds `*_ky` twins (base columns = Russian, empty `_ky` falls back to Russian). API reads `?lang=` → `X-Lang` → cookie; repos use `col(lang, …)`. Admin forms have Kyrgyz fields (categories, products incl. specs, banners, settings). Seed and mock data (`backend/scripts/mock-data.ts`) regenerated in RU/KY.
- [x] 4.3 Storefront strings → dictionaries (header, home, catalog, product, cart, checkout, order, tracking, login, 404, SEO metadata).
- [x] 4.4 Admin strings → dictionaries (shell, dashboard, orders, products, categories, banners, reviews, staff, settings).
- [x] 4.5 Backend error/validation messages (zod + `core/http.ts`) in RU/KY by request lang; mock API messages too.
- [x] 4.6 Storefront density pass: card price block fixed-height (old price above, price never wraps, CTA aligned per row); grid columns tuned per breakpoint (`ProductGrid layout="full" | "sidebar"`); home rails show only complete rows; tighter section rhythm (hero, categories, benefits, promo); catalog sort moved into title row on lg+; product page 2-column on tablet; mobile cart overflow fixed; mock `/public/orders/quote?lang=` 503 fixed. Verified by layout audit (7 widths 360–1440 × 7 pages × 3 runs: overflow, price wrap, CTA alignment, half rows, console errors).
