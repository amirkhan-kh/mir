# 00 router

Map the request to **one** domain file + **≤ 1** skill. Then work. Then stop.

## Inputs

User prompt · `docs/TASKS.md` · touched paths (if user named files).

## Route table

| Request smells like | Domain file | Skill | Scope folders |
|---|---|---|---|
| endpoint, SQL, migration, 409/422, role, transaction | `BACKEND.md` | `02-architect` if new write-path | `backend/src/modules/<d>`, `backend/migrations` |
| page, form, modal, button, layout, copy, chart | `FRONTEND.md` | `02-architect` if new screen | `frontend/src/features/<d>`, `frontend/src/app/**` |
| new module end-to-end | `ARCHITECTURE.md` (+ BACKEND, FRONTEND allowed) | `02-architect` | both |
| test, QA, bug repro, "check it works", regression | `TESTING.md` | `04-ui-testing` | `frontend/e2e`, `frontend/playwright.config.ts` |
| SEO, speed, Lighthouse, storefront, `/login` look | `FRONTEND.md` | `03-lighthouse` | `frontend/src/app/{(shop),login}`, `features/storefront` |
| deploy, VPS, HTTPS, env, Docker | `DEPLOY.md` | — | `docker-compose.yml`, Dockerfiles |
| "what is this project", explain | `ARCHITECTURE.md` | — | read-only |
| shorter answers, tone | `CAVEMAN.md` | `01-caveman` | — |
| stack / framework question | `STACK.md` | — | read-only (never switch) |

Bug report without a test? Route to `TESTING.md` + `04-ui-testing`: write the failing S3 test first, then fix.

## Steps

1. Pick the row. Ties → the one owning the data (backend beats frontend for rule bugs).
2. Write: `Scope: <folders> · Check: <command>`.
3. Find the target fast: `rg "<Uzbek UI label>" frontend/src` for UI, `rg "<route path>" backend/src` for API.
4. Out-of-scope need → `Need permit:` (`docs/STRICT.md`).
5. After report → stop. Leftovers → new `TASKS.md` line, not more work.
