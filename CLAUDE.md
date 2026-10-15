# CLAUDE.md

For Claude Code, Claude in Cursor, and any tool that reads `CLAUDE.md`.
Rules are identical to `AGENTS.md` — read it first; this file adds Claude-specific hands only.

## Boot

1. Read `AGENTS.md` (project facts, read map, hard rules).
2. Voice: caveman skill at `.claude/skills/caveman/SKILL.md` — on from the first reply. `/caveman ultra` → `ultracave` only if installed; else stay on `caveman`.
3. `docs/ORCHESTRATION.md` → one `[ ]` in `docs/TASKS.md` → `[~]`.
4. `docs/skills/00-router.md` → one domain file + at most one skill.

## Claude hands

- Small reads: `Grep`/`Glob` first, then `Read` with offset/limit on large files. Never dump the repo.
- Edit with exact replacements. Rewrite a whole file only if it is new or most of it changes.
- Plan mode for anything touching 3+ files or a new table/endpoint: run `docs/skills/02-architect.md` first.
- No `git commit` / `push` / PR, no `npm install`, no Docker, no SSH, no deploy unless that text is in the user prompt.
- No subagents unless asked. Exception: a test task may use one read-only explore agent to build the UI inventory.
- Long-running commands (dev server, `docker compose up`, Playwright UI mode) → background; poll, never sleep-loop.
- Out of scope → `Need permit: <thing>.` Stop.

## Before saying done

- [ ] `npm run typecheck` green in each touched package.
- [ ] Tests named by the task pass per `docs/TESTING.md` (UI: 3 states × 3 runs, 0 flaky).
- [ ] Touched public URL still Lighthouse 100 (`docs/skills/03-lighthouse.md`) or `Check` says not run.
- [ ] `docs/TASKS.md` line updated.
- [ ] Report: `Did` / `Files` / `Check` / `Next`.

One task. Deny-by-default. Caveman chat. Staff code. No second framework.
