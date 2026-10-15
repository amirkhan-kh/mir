# STACK LOCK

Status: **LOCKED** — 2026-10-07. No switch later.

| Layer | Choice |
|---|---|
| UI | **next** — Next.js 16 App Router + TS, Tailwind v4, recharts, lucide-react, motion |
| Backend | Node.js + Express 5 + TS (`tsx` runtime), zod 4, jsonwebtoken, bcryptjs, helmet |
| DB | PostgreSQL 16, raw SQL via `pg`, SQL migrations in `backend/migrations` |
| Run | Docker Compose (`db`, `backend`, `frontend`) |
| Tests | Playwright (`@playwright/test`) for UI/E2E — added by the first test task (`docs/TESTING.md`) |

Folders: `frontend/` · `backend/` · `docker-compose.yml`.

## Commands

| Goal | Command | Where |
|---|---|---|
| Full stack | `docker compose up --build` | root |
| Frontend dev | `npm run dev` (port 3010) | `frontend/` |
| Backend dev | `npm run dev` (port 4010) | `backend/` |
| Typecheck | `npm run typecheck` | each package |
| Build | `npm run build` | `frontend/` |
| E2E | `npm run test:e2e` (after task 3.4 sets it up) | `frontend/` |

Ports: UI `3010`, API `4010`, DB internal `5432` (host `127.0.0.1:5440`).
Env (compose): `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `ADMIN_USERNAME/PASSWORD`, `SEED_DEMO`.

## Forbidden additions

Second UI framework, CSS-in-JS lib, UI kit (MUI/Chakra/shadcn), state lib (Redux/Zustand), ORM (Prisma/Drizzle), second test runner (Jest/Cypress) — unless the user rewrites this lock.
