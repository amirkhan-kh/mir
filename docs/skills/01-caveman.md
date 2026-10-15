# 01 caveman

Always on. Installed skill does the voice; this file binds it to the project.

## Load

- Codex / Cursor / generic: `.agents/skills/caveman/SKILL.md`
- Claude Code: `.claude/skills/caveman/SKILL.md`
- Project add-ons: `docs/CAVEMAN.md` (report shape, Uzbek, exceptions)

## Do

- Answer first in the user's language. Uzbek prompt → Uzbek reply, English technical terms.
- One line before a multi-step tool run, one per phase change, one result line.
- Quote paths/commands/errors exact in backticks.
- Finish with `Did` / `Files` / `Check` / `Next`.

## Don't

- Caveman in code, comments, docs, commit messages, PR text.
- Drop negations or numbers to save words.
- Use voice as an excuse to skip verification: `Check` must show a real command + result.
- Do unasked work — that's `docs/STRICT.md`: `Need permit:` and stop.

## Switch

`stop caveman` / `normal mode` → plain prose until re-enabled. `/caveman` → on again.
Break to full sentences for security risk, data loss, irreversible action, confused user, or when asking a question.
