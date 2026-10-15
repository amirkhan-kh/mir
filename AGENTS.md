# AGENTS.md

Root contract for every agent: Cursor (Auto, Grok, Composer), Codex, Gemini, Claude, others.
Pair: `AGENTS.md` + `CLAUDE.md` (same rules, Claude-specific hands). All other markdown lives in `docs/`.

## Project in 5 lines

Mir — e-commerce for one household appliances & electronics brand (Uzbek UI, uzum.uz-style). Storefront: banners, catalog, product page (gallery, installment, reviews), cart, checkout, order tracking. Admin `/admin`: orders, products, categories, banners, reviews, staff, settings. Orders go to own staff (manager + couriers), no marketplace delivery.
Stack **LOCKED** (`docs/STACK.md`): Next.js 16 + Tailwind v4 · Express 5 + zod · PostgreSQL 16 raw SQL · Docker Compose.
Run: `docker compose up --build` → UI `http://localhost:3010`, API `http://localhost:4010/api/v1`, health `/health`, DB `127.0.0.1:5440`.
Logins: `admin/admin123` · demo (`demo123`): `manager`, `courier1..2` from `backend/src/core/seed.ts`.
Checks: `npm run typecheck` in `frontend/` and `backend/`. UI tests: `docs/TESTING.md`.

## Boot (every session)

1. Read this file. Voice = caveman (below). Hands = `docs/STRICT.md`.
2. `docs/ORCHESTRATION.md` → pick one `[ ]` in `docs/TASKS.md` (or the explicit user task) → mark `[~]`.
3. Route with `docs/skills/00-router.md` → open **one** domain file + at most **one** skill.
4. Grep → small reads → plan (`docs/skills/02-architect.md` for any new write-path) → edit → verify → report.
5. Mark `[x]` (or `[!]` + reason). Stop.

## Read map

| Need | Open |
|---|---|
| Session flow, handoff | `docs/ORCHESTRATION.md` |
| What is allowed | `docs/STRICT.md` |
| Voice / report | `docs/CAVEMAN.md` + `.agents/skills/caveman/SKILL.md` |
| Stack lock, commands | `docs/STACK.md` |
| Modules, invariants | `docs/ARCHITECTURE.md` |
| API work | `docs/BACKEND.md` |
| UI / SEO work | `docs/FRONTEND.md` |
| Tests (UI 3×3 matrix) | `docs/TESTING.md` + `docs/skills/04-ui-testing.md` |
| Lighthouse 100 | `docs/skills/03-lighthouse.md` |
| Ship | `docs/DEPLOY.md` |
| Queue | `docs/TASKS.md` |

Do not open `BACKEND.md` and `FRONTEND.md` in one turn unless the task spans both (e.g. new module end-to-end).

## Skills

| Skill | Use when |
|---|---|
| `docs/skills/00-router.md` | Start of every task: map request → files |
| `docs/skills/01-caveman.md` | Always on: voice + report shape |
| `docs/skills/02-architect.md` | New endpoint, table, page, or state change |
| `docs/skills/03-lighthouse.md` | Public page touched (`/`, `/login`) or Lighthouse asked |
| `docs/skills/04-ui-testing.md` | Any test task, any UI change that needs proof |
| `.agents/skills/caveman/SKILL.md` | Installed caveman voice (also `.claude/skills/caveman`) |

## Caveman (always on)

Chat replies follow `.agents/skills/caveman/SKILL.md` from the first message. Off only on `stop caveman` / `normal mode`.
Reply in the user's language (usually Uzbek). Code, docs, commits, comments: normal full prose — caveman is chat-only.
End every task with the report from `docs/CAVEMAN.md`: `Did` / `Files` / `Check` / `Next`.

## Hard rules

1. One session = one task. Fat chat → new session.
2. Prompt = allow-list. Undeclared git, install, deploy, delete, Docker, secrets → `Need permit: <thing>.` Stop.
3. Staff code: `router → service → repository`; `app/` thin → `features/<domain>` → `shared/ui`. No extra layers, no drive-by refactor, no new package without permit.
4. Invariants in `docs/ARCHITECTURE.md` never break (stock never negative, order state machine, price snapshot, idempotent checkout).
5. Done = typecheck green + task-relevant tests green (UI: 3 states × 3 runs, `docs/TESTING.md`) + Lighthouse 100 on touched public URL.
6. Never claim done without running the check. Can't run it → say so in `Check`.
7. Next.js 16 differs from training data: read `frontend/AGENTS.md` and `frontend/node_modules/next/dist/docs/` before new Next APIs.
