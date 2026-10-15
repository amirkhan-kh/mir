# STRICT

Prompt = allow-list. Default deny. Hands only — voice is `docs/CAVEMAN.md`.

## Always OK

- Read anything in the repo.
- Edit files inside the task `Scope`.
- Update the task line in `docs/TASKS.md`.
- Run read-only / local checks: `npm run typecheck`, `npm run build`, the test command named by the task, `git status`, `git diff`.
- Commands the user typed verbatim.

## Need permit

| Area | Examples |
|---|---|
| Git writes | `commit`, `push`, branch, PR, rebase, reset, stash |
| Packages | `npm install <pkg>`, version bumps, lockfile churn |
| Deletes / renames | Delete files, rename public routes, API paths, DB columns |
| Infra | `docker compose up/down -v`, SSH, deploy, prod migrate, DB reset |
| Secrets | `.env*`, CI config, keys, `JWT_SECRET` |
| Scope creep | Extra pages/docs, repo-wide format, new lint rules, drive-by refactor |
| External | Network calls that change remote state, emails, webhooks |

Format: `Need permit: <thing> — <why, 1 line>.` Stop this turn.

## Standing permits (task text grants them)

A task line or user prompt that names the thing grants it for that session only:

- "tests" / task `3.2`, `3.4` → may add `@playwright/test` (dev) to `frontend/`, add `test:e2e` scripts, create `frontend/e2e/**`, `frontend/playwright.config.ts`, run Docker Compose for the test stack.
- "deploy" / task `3.3` → may build images, run migrations on the target, edit `docker-compose.yml`.
- "lighthouse" / task `3.1` → may run `npx lighthouse` against local URLs.

## Never (even with permit, ask twice)

- `docker compose down -v` on a DB with real data.
- Force-push to `main`.
- Commit secrets or real customer data.

Unclear → one question. No "better" substitute command. No silent workaround around a denied step.
