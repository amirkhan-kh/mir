# Architecture

Smallest correct cut. One truth per fact. Same domain name on API, DB, and UI folder.

## Shape

```
browser ── Next.js (frontend/, :3010) ── /api/v1/*, /uploads/* rewrite ──> Express (backend/, :4010) ── pg ──> PostgreSQL
            app/ (thin routes)                                   app.ts → modules/<domain>/router
            features/<domain>/ (screens)                         router → service → repository → db
            shared/ui, shared/lib                                core/ (auth, db, http, config, seed)
```

Auth (staff only — shoppers never log in): JWT in `mir_token` httpOnly cookie (or `Bearer`). `frontend/src/proxy.ts` redirects `/admin/*` → `/login?next=…` without cookie. Backend `requireAuth` on everything except `/auth/*` and `/public/*`. Roles: `admin`, `manager`, `courier`; gate `allow(...roles)`; `admin` passes all. `requireAuth` loads `role`, `active`, `token_version` from `users` on every request (JWT carries `v`); bumping `token_version` (role change, password reset/change, block) ends all sessions of that user. Login: 5 failures per username+IP → 15 min lock (429, in-memory, single API process).

Shopper state: cart (`mir_cart`) and favorites (`mir_fav`) live in `localStorage` (`features/cart/store.ts`, `useSyncExternalStore`). Server never trusts them: `POST /public/orders/quote` re-prices against live price + stock, `POST /public/orders` re-checks inside the transaction. Order tracking = order number + phone (last 9 digits must match).

## Module map (backend `modules/` ↔ frontend `features/` ↔ route)

| Domain | Backend | UI route | Writes |
|---|---|---|---|
| auth | `auth` | `/login` | session cookie, password change |
| dashboard | `dashboard` | `/admin` | — (KPIs, 14-day sales, top, low stock) |
| categories | `categories` | `/katalog`, `/katalog/[slug]` · `/admin/kategoriyalar` | CRUD |
| products | `products` | `/`, `/mahsulot/[slug]` · `/admin/tovarlar`, `/yangi`, `/[id]` | CRUD, images, specs |
| banners | `banners` | `/` hero + promo · `/admin/bannerlar` | CRUD |
| orders | `orders` (service) | `/savat`, `/rasmiylashtirish`, `/buyurtma/[number]`, `/kuzatish` · `/admin/buyurtmalar`, `/[id]` | public quote + create, status machine, courier assign |
| reviews | `reviews` | product page · `/admin/sharhlar` | public create (pending), moderate → rating |
| users | `users` | `/admin/xodimlar` (admin) | CRUD, reset password |
| settings | `settings` | header/footer/checkout · `/admin/sozlamalar` (admin) | store contacts, delivery fee, installment plans |
| uploads | `uploads` | `ImageUploader` in admin forms | image → `uploads/YYYY-MM/` |

`service.ts` exists only where a rule spans tables. Pure CRUD = router + repository.

## Invariants (never break; tests must cover)

1. **Stock**: `products.stock >= 0` (DB CHECK). Order create decrements stock under `SELECT … FOR UPDATE`; not enough → 409, nothing written. `cancelled` restores stock; `delivered` adds to `sold_count`.
2. **Order state machine**: `new → confirmed | cancelled`, `confirmed → delivering | cancelled`, `delivering → delivered | cancelled`. Terminal: `delivered`, `cancelled`. Every change writes `order_events`. Courier moves only orders assigned to them, only `confirmed → delivering → delivered`.
3. **Price snapshot**: `order_items` copy name, price, image at create; later product edits never change an order. Client-sent prices are ignored.
4. **Idempotent checkout**: `orders.idempotency_key` UNIQUE; a retried submit returns the same order (no second stock decrement).
5. **Pricing**: delivery fee only for courier orders with `subtotal < free_delivery_from`. Installment: `total = round(subtotal × (1 + percent/100)) + delivery_fee`, `monthly = ceil(total / months)`; plans come from `settings.store.installment`.
6. **Product price**: `old_price` null or `> price` (DB CHECK). Slug and SKU unique (409).
7. **Reviews**: public reviews start `pending`; only `approved` count. Moderation recalculates `products.rating` / `reviews_count` in the same transaction.
8. **Money**: `NUMERIC(14,2)`, whole so'm in service (`roundMoney`), never float-compare in SQL.
9. Multi-row writes run in `tx()` with `SELECT … FOR UPDATE` on the row that guards the rule.
10. **Staff management**: at least one active admin always remains; an admin cannot block self or change own role.

## Boundaries

- Rules live in `service.ts`. SQL lives in `repository.ts`. Router = parse + authz + call + status code.
- FE route file (`app/**/page.tsx`) = metadata + one feature component. Logic in `features/<domain>`.
- `shared/ui` = dumb primitives (Button, Field, Modal, Page, Badge, States). `shared/lib` = `api`, `useApi`, `usePaged`, `format`, `status`.
- Cross-domain import only service → other repository (e.g. orders → products, settings). Never router → router.
- No god files (> ~300 lines → split by sub-screen), no circular imports, no packages "for scale", no second state lib, no copy-paste types drifting from API.

## Adding a module

1. `TASKS.md` line. 2. Migration `backend/migrations/00N_<name>.sql`. 3. `modules/<name>/{repository,router}.ts` (+ `service.ts` if multi-table rule). 4. Mount in `app.ts` (secured unless public). 5. `features/<name>/` (admin screens under `features/admin/<name>/`) + `app/admin/<name>/page.tsx` + nav item in `features/admin/AdminShell.tsx`. 6. Add rows to the UI matrix in `docs/TESTING.md`.
