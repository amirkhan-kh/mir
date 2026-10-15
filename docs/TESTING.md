# Testing

Runner: **Playwright** (`@playwright/test`) for UI, E2E and API — one runner, no Jest/Cypress/Vitest.
Procedure (loop until 100%): `docs/skills/04-ui-testing.md`. This file = rules + matrix.

## When

| Task | What runs |
|---|---|
| Test task (`3.2`, `3.4*`, "test …") | Full matrix rows for the named scope, 3×3 rule, loop to 100% |
| Any UI change | Matrix rows of the touched screen + `G-*` rows, 3×3 rule |
| Any API change | API rows for the touched module (happy · 401 · 403 · 422 · 409) |
| Docs-only / copy-only | typecheck only |

## The 3×3 rule

Every matrix row (one function the user can trigger) is tested in **3 states**, and every test runs **3 times**.

| State | Meaning | Typical inputs |
|---|---|---|
| **S1 — happy** | Valid action, expected result in UI **and** in data | Normal values, default role |
| **S2 — edge** | Boundary or unusual-but-valid | min/max (`0`, `1`, `50`, limit exactly), empty list, long text (120+), Uzbek apostrophes `O'g'il`, Cyrillic, spaces, keyboard-only (Tab/Enter/Esc), mobile 375px, second click / toggle back |
| **S3 — negative** | Must be rejected or handled gracefully | Missing `required`, out-of-range, duplicate (409), rule break (409), wrong role (403), no session (401), server 500 / network fail (via `page.route`), double-click submit |

3 runs: `--repeat-each=3` with `retries: 0`. A test that passes 2/3 is **flaky = failed**.
Per row: 3 states × 3 runs = **9 green executions** minimum.

## Done bar (100%)

All must be true for the scope, else keep looping:

1. Every matrix row in scope has tests tagged `[ID][S1]`, `[ID][S2]`, `[ID][S3]` (coverage command below = expected count).
2. `npm run test:e2e` → 0 failed, 0 flaky, 0 skipped, 0 `test.fixme`/`test.only`.
3. 0 console errors, 0 `pageerror`, 0 unexpected 5xx (fixture fails the test).
4. Each S1 asserts the **data effect**, not just a toast: re-read via API or reload page.
5. `npm run typecheck` green in `frontend/` and `backend/`.

A real product bug found by a test → fix it in the same task if it's inside scope (small diff); else `[!]` + new `TASKS.md` line. Never weaken an assertion to make it pass.

## Setup (first test task creates this — standing permit in `docs/STRICT.md`)

```
frontend/
  playwright.config.ts
  e2e/
    fixtures.ts          login per role (storageState), api helper, console/5xx guard, unique()
    global-setup.ts      wait /health, create storageState for admin, manager, courier
    factories.ts         create category/product/banner/order via API with unique names
    api/*.spec.ts        API rows (request fixture)
    <screen>.spec.ts     one file per screen below
```

Config essentials:

```ts
export default defineConfig({
  testDir: "e2e",
  retries: 0,
  repeatEach: 3,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://localhost:3010", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
});
```

Scripts in `frontend/package.json`: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"`.
Stack: `docker compose up --build -d` (fresh: needs permit for `down -v`).

## Writing rules

- **Selectors**: `getByRole` / `getByLabel` / `getByText` with Uzbek copy. No CSS classes, no XPath. Missing accessible name → add `aria-label` in the component (that's an a11y fix), not `data-testid`.
- **Data**: seed is random — never assert seeded values (except `admin` login). Each test creates its own data via `factories.ts` with `unique()` suffix (`Date.now()` + `testInfo.repeatEachIndex`), so 3 repeats never collide on UNIQUE columns.
- **Isolation**: no test depends on another's order. Workers = 1 because the DB is shared.
- **Waits**: web-first assertions (`await expect(x).toBeVisible()`), `waitForResponse` for submits. Never `waitForTimeout` (debounce: wait for the list response).
- **Error states**: `page.route("**/api/v1/<path>*", r => r.fulfill({ status: 500, json: { error: "Server xatosi" } }))`. Loading: delay the route, assert `role=status`.
- **Native dialogs** (`confirm`): test both `dialog.accept()` and `dialog.dismiss()`.
- **Title format**: `test("[CHK-03][S3] rasmiylashtirish: qoldiq yetmasa xato", …)`. Tag mobile rows ` @mobile`.

## Commands

```bash
npm run test:e2e                                   # full, 3 repeats from config
npx playwright test e2e/checkout.spec.ts           # one screen
npx playwright test -g "\[CHK-03\]"                # one row
npx playwright test --repeat-each=10 -g "\[CHK-03\]"   # flake hunt
npx playwright show-report                         # failures with trace
# coverage: tagged ids × states present
npx playwright test --list | rg -o "\[[A-Z]+-[0-9]+\]\[S[123]\]" | sort -u | wc -l
```

## Matrix

ID → function → what S1 / S2 / S3 must prove. **Every row = 3 states × 3 runs. Priority only orders the work; P3 is still mandatory.**

### L — list contract (apply to every admin list screen: ORD, PRD, REV, STF)

Each screen gets its own copies: `ORD-L1`, `PRD-L1`, …

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| L1 | Search | Match by name → only matching rows | No match → `Empty`; apostrophe/Cyrillic/spaces; clear → full list | Type fast + clear before 300ms → one final request, page reset to 1 |
| L2 | Status/category Chips | Each option filters; `aria-pressed` moves | Counts equal rows; back to "Barchasi" | Chip change on page 2 → page resets to 1 |
| L3 | Pagination | Next/prev change rows and `n / N` | Prev disabled on 1, next disabled on last; single page both disabled | Search while on last page → page 1, no empty gap |
| L4 | States | Loading `role=status` then table | Empty dataset → `Empty` text | API 500 → `ErrorState` + "Qayta urinish" recovers |

### G — global / shell (P0)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| G-01 | Route guard | Logged in → `/admin/*` opens | Deep link + reload keeps page | No cookie → `/login?next=<path>`; after login returns to `next` |
| G-02 | Admin sidebar nav (every item) | Click → URL + heading + active item | Keyboard Tab+Enter | Unknown `/admin/x` → not-found, no crash; courier sees only allowed items |
| G-03 | Storefront header + mobile tab bar `@mobile` | Logo, Katalog menu, search, Sevimlilar, Savat navigate | Cart / favorite badges update after add | Unknown `/mahsulot/x` → 404 page with way back |
| G-04 | Logout "Chiqish" | → `/login`, cookie gone | Back button after logout → redirected to login | Logout API 500 → still no access to admin |
| G-05 | Session expiry | — valid session works | Courier token sees only own orders | API 401 mid-session → redirect `/login?next=` |
| G-06 | Modal (shared) | Opens with title, X "Yopish" closes | Esc and backdrop click close; reopen shows clean form | Submit error keeps modal open with `Alert` |

### SHOP — home `/` + catalog `/katalog` (P1)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| SHOP-01 | Hero carousel | Arrows / dots switch slide, CTA link opens target | Autoplay pauses on hover; reduced motion → no autoplay | No active banners → section hidden, no crash |
| SHOP-02 | Category tiles + rails | Tile → `/katalog/<slug>`; "Barchasi" → filtered catalog | Mobile horizontal scroll `@mobile` | Inactive category absent; `/katalog/x` → 404 |
| SHOP-03 | Search | Query → matching products only | Cyrillic / apostrophe / spaces; empty query → all | No match → `Empty` with reset link |
| SHOP-04 | Filters + sort ("Filtrlar", "Ommabop") | Brand, price, discount, in-stock filter rows; sort changes order | Mobile sheet `@mobile`; URL keeps state on reload | min > max → no crash; "Filtrlarni tozalash" resets |
| SHOP-05 | Product card | Price, old price, discount %, monthly installment, rating visible; click → product page | Out of stock → disabled cart button; low stock badge | Image missing → placeholder, no layout shift |
| SHOP-06 | SEO / meta (P2) | title, description, canonical, OG on `/`, `/katalog/*`, `/mahsulot/*`; JSON-LD Product | `/login` has unique title; sitemap lists products | No duplicate `h1`, images have `alt` |

### PDP — product page `/mahsulot/[slug]` (P1)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| PDP-01 | Gallery | Thumbs / arrows switch image, counter `n / N` | Keyboard arrows; single image → no arrows | Swipe on mobile `@mobile` |
| PDP-02 | Installment tabs (12 / 6 / 3 oy) | Monthly amount = `ceil(total / months)` with plan percent | Switch tabs back and forth | No plans in settings → block hidden |
| PDP-03 | "Savatga qo'shish" / "Hoziroq xarid qilish" | Adds to cart; buy now → checkout with this item | Qty stepper up to stock; second click → qty +1 | Out of stock → buttons disabled; qty > stock blocked |
| PDP-04 | Favorite toggle | Heart → `/sevimlilar` lists it | Toggle back removes | Survives reload (localStorage) |

### CART — `/savat`, `/sevimlilar` (P0)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| CART-01 | Qty stepper + remove | Totals update; remove → row gone | Qty to exact stock; remove last → `Empty` | Price / stock changed on server → quote shows new value + warning |
| CART-02 | Free-delivery progress | Below threshold shows remaining amount | Exactly threshold → free | Settings change reflected after reload |

### CHK — checkout `/rasmiylashtirish` (P0)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| CHK-01 | Contact step (ism, telefon) | Valid → next step; phone saved as `+998XXXXXXXXX` | Saved customer prefilled on return; `O'g'il` name | Empty / short phone → blocked |
| CHK-02 | Delivery (kuryer / olib ketish) + payment (naqd / karta / muddatli) | Courier adds fee under threshold; pickup → 0 fee; installment shows month cards | Address required only for courier | Installment without plan → blocked |
| CHK-03 | Submit | Order created `new`, stock −qty, cart cleared, `/buyurtma/<number>` shown | Same idempotency key re-submit → same order, stock once | Stock gone meanwhile → 409 message, cart kept; API 500 → error; double click → one order |

### TRK — `/kuzatish`, `/buyurtma/[number]` (P0)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| TRK-01 | Track form (raqam + telefon) | Correct pair → status stepper | Phone in any format (last 9 digits) | Wrong phone or number → not found message, no data leak |

### AUTH — `/login` (P0)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| AUTH-01 | Login submit | `admin/admin123` → `/admin` | Each role (`manager`, `courier1`) with `demo123`; Enter key submits | Wrong password → `Alert`; empty fields → native block; API 500 → error; button disabled while loading |
| AUTH-02 | Show/hide password | Toggle → `type=text` | Toggle back → `type=password` | Toggle does not submit the form |
| AUTH-03 | `next` redirect | `?next=/admin/buyurtmalar` → lands there | Already logged in visiting `/login` | `next=https://evil.com` → stays on-site |
| AUTH-L | Login lockout | 6th attempt → 429 message with minutes | Correct password after lock still 429 | Blocked user → 403 |

### DSH — `/admin` (P1)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| DSH-01 | KPI cards | Render numbers | Values change after a new order (re-visit) | API 500 → error state |
| DSH-02 | Sales chart, top products, low stock, recent orders | Render with data; links navigate | Empty data → no crash | Resize to 375px `@mobile` |

### ORD — `/admin/buyurtmalar` (P0) + `ORD-L1..L4`

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| ORD-01 | New order badge | Storefront order → sidebar badge within 30s | Badge clears after confirm | API error → no crash |
| ORD-02 | Status actions | `new → confirmed → delivering → delivered`, history row each | Cancel from each non-terminal → stock restored | Skip state → 409; no actions on terminal states |
| ORD-03 | Assign courier | Persists after reload; courier sees it | Reassign | Courier moving another's order → 403 |
| ORD-04 | Note | Saved and shown | Long text 500 chars | API 500 → `Alert`, text kept |

### PRD / CAT / BNR — catalog admin (P1) + `PRD-L1..L4`

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| PRD-01 | Product form (nomi, SKU, kategoriya, narx, eski narx, qoldiq, rasmlar, xususiyatlar, faol, tavsiya) | Valid → saved, visible on storefront | Live preview matches card; image reorder; stock `0` → "tugagan" | Duplicate SKU/slug → 409; old price ≤ price → 409; bad image type → error |
| PRD-02 | Status chips (faol, nofaol, kam, tugagan, tavsiya) | Counts equal rows | Back to "Barchasi" | Chip change on page 2 → page 1 |
| CAT-01 | Category CRUD | Create / rename / toggle active | Sort order changes storefront order | Delete with products → 409 |
| BNR-01 | Banner CRUD (hero / promo, theme, image, link) | Appears on `/` in its slot | Inactive → hidden; reorder | Missing image / bad link → 422 |

### REV / STF / SET (P2)

| ID | Function | S1 | S2 | S3 |
|---|---|---|---|---|
| REV-01 | Public review form | Submitted → "moderatsiyada" | 1 and 5 stars; long text | Rate limit → 429 message; empty → blocked |
| REV-02 | Moderate (approve / reject / delete) | Approve → visible, product rating updated | Reject approved → rating recalculated | Non-staff → 401 |
| STF-01 | Staff create / edit / reset password / block | Created user logs in | Role change ends session | Duplicate login → 409; own role change / block → blocked; last admin → 409 |
| SET-01 | Store settings (aloqa, yetkazish, muddatli to'lov) | Saved → header, checkout, PDP reflect | Free-delivery threshold `0` | Manager → 403; invalid plan → 422 |

### API (Playwright `request`, per module)

| ID | Endpoint group | S1 | S2 | S3 |
|---|---|---|---|---|
| API-AUTH | `/auth/*` | login sets cookie | logout clears | bad creds 401 |
| API-<MOD> | each `/api/v1/<module>` mutating route | 200/201 + body | boundary values accepted | 401 no cookie · 403 wrong role · 422 bad body · 409 rule/duplicate |

Invariants from `docs/ARCHITECTURE.md` (stock never negative, state machine, price snapshot, idempotent checkout) each need at least one API S3 test that tries to break them.

## Report

```
Check: npm run test:e2e -- <scope> → <passed>/<total> passed · flaky 0 · skipped 0
Coverage: <ids×states found>/<expected> (rg command above)
Bugs: <fixed in this task> · <new TASKS lines>
```
