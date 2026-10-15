# Orchestration

1 session = 1 task. Fat chat (context > ~60%, or task changed) → new session with a handoff.

## Loop

1. **Boot** — root `AGENTS.md` or `CLAUDE.md`.
2. **Lock** — `docs/STACK.md` is LOCKED. Never switch framework, never add a second UI kit / state lib / ORM.
3. **Pick** — `docs/TASKS.md`: first `[ ]` the user named (or top `[ ]` if user said "next") → `[~]`.
4. **Route** — `docs/skills/00-router.md` → one domain file + ≤ 1 skill.
5. **Scope** — write it in one line before editing: `Scope: <folders/files> · Check: <command>`.
6. **Read** — Grep for the symbol/route/label, read only the hits. Copy the nearest existing pattern.
7. **Plan** — new write-path, table, page, or state change → `docs/skills/02-architect.md`. Else skip.
8. **Do** — smallest diff that satisfies the task. No unrelated edits.
9. **Verify** — typecheck + task tests (`docs/TESTING.md`). Red → fix → rerun. Loop until green or blocked.
10. **Close** — `[x]` (green) or `[!] <reason>` (blocked). Report per `docs/CAVEMAN.md`. Stop.

## Task status

| Mark | Meaning |
|---|---|
| `[ ]` | Not started |
| `[~]` | In progress (only one at a time) |
| `[x]` | Done + verified |
| `[!]` | Blocked — reason after the line, e.g. `[!] 3.2 — needs permit: install @playwright/test` |

Big task (> ~8 files or 2 domains)? Split into sub-lines `3.4a`, `3.4b` in `TASKS.md`, do the first only.

## Handoff (when a session must end early)

Append under the task line in `docs/TASKS.md`:

```
  - handoff: <done so far> · <next exact step> · <failing check output, 1 line>
```

The next session reads it and continues — no re-discovery.

## Stop conditions

- Task green → stop. Do not start the next task.
- Need something outside scope → `Need permit: <thing>.` Stop.
- Same check fails 3 times with the same root cause and no new idea → `[!]` + handoff. Stop.
- Ambiguous requirement that changes the design → one question (`AskQuestion` when available). Stop.
