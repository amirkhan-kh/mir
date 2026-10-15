# 04 UI testing — loop to 100%

Rules and matrix: `docs/TESTING.md`. This skill = the procedure. Do not stop until the Done bar is met or a stop condition hits.

## 0. Prepare (once per repo)

1. `frontend/playwright.config.ts`, `frontend/e2e/{fixtures,global-setup,factories}.ts` exist? If not, create per `TESTING.md` → Setup (standing permit for test tasks).
2. Stack up: `curl -fs http://localhost:4010/health && curl -fsI http://localhost:3010` — both OK, else start `docker compose up --build -d` (background) and poll.
3. Smoke: `npx playwright test -g "\[AUTH-01\]\[S1\]" --repeat-each=1` green before writing more.

## 1. Inventory the scope

1. Pick screens from the task (or the touched screen).
2. List every interactive control in it — nothing is "too small":
   `rg -n "onClick|onSubmit|onChange|<select|type=\"(checkbox|radio|number|date|tel)\"|href=|aria-label|required|min=|max=" frontend/src/features/<d>`
3. Every control must map to a matrix row in `TESTING.md`. Missing → add a row (ID, S1, S2, S3) first.
4. Expected count = rows × 3. Write it down.

## 2. Write tests — one row at a time

For each row, three tests: `[ID][S1]`, `[ID][S2]`, `[ID][S3]`.

- Arrange via `factories.ts` (API, unique names). Never via seeded data.
- Act like a user: `getByRole` / `getByLabel`, click, type, keyboard.
- Assert UI **and** data (reload or API re-read). S3 also asserts that nothing changed.
- Error paths with `page.route` (500, delay). Dialogs: accept and dismiss.

## 3. Run → triage → fix → rerun

```
run   npx playwright test e2e/<screen>.spec.ts            (repeatEach 3 from config)
red?  open trace (npx playwright show-report) → classify:
        test bug      → fix the test (selector, wait, data)
        product bug   → write/keep the failing test, fix the code (smallest diff in scope)
        flaky (≤2/3)  → find the race (missing await, debounce, shared data); never add retries/timeouts
        env           → stack down / port busy → fix env, rerun
rerun same file until 0 failed · 0 flaky
```

Flake hunt for any test that was ever red: `npx playwright test -g "\[ID\]" --repeat-each=10` must be 10/10.

## 4. Gate

1. Full scope: `npm run test:e2e` → 0 failed, 0 flaky, 0 skipped.
2. Coverage: `npx playwright test --list | rg -o "\[[A-Z]+-[0-9]+\]\[S[123]\]" | sort -u | wc -l` = expected count.
3. `rg -n "test\.(only|fixme|skip)|waitForTimeout" frontend/e2e` → no hits.
4. `npm run typecheck` in `frontend/` (and `backend/` if code changed).
5. Not all true → back to step 2/3. **Loop.**

## Stop conditions

- Gate green → report (`TESTING.md` → Report), mark `[x]`.
- Same failure 3 iterations, same root cause, no new hypothesis → `[!]` + handoff in `TASKS.md`.
- Fix needs out-of-scope change (schema, other module, new package) → `Need permit:`.
- Context nearly full → handoff line with last green row ID, continue in a new session.

## Anti-patterns (reject in review)

`waitForTimeout` · `retries > 0` · `test.skip` to go green · CSS/XPath selectors · asserting only a toast · tests sharing data · editing the assertion to match a bug · one giant test covering many rows.
