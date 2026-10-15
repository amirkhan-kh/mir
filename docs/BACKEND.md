# Backend

Express 5 + TS + zod + raw `pg`. API tasks only. Read `docs/ARCHITECTURE.md` invariants first.

```
backend/
  migrations/00N_name.sql       forward-only SQL, run by core/migrate.ts on boot
  src/core/                     auth (requireAuth, allow, signToken) · db (pool, tx) · http (HttpError, parse, pageOf, idParam, errorHandler) · config · seed
  src/modules/<domain>/         router.ts · repository.ts · service.ts (only for multi-table rules)
  src/app.ts                    mounts /api/v1/<domain>; public vs secured
```

## Write-path template

```ts
// router.ts — parse, authz, call, status
const createSchema = z.object({ name: z.string().trim().min(1).max(120), qty: z.coerce.number().int().positive() });
xRouter.post("/", allow("manager"), async (req, res) => {
  res.status(201).json(await service.create(parse(createSchema, req.body), req.user!.id));
});

// service.ts — rules inside one transaction
export const create = (input: Input, userId: number) =>
  tx(async (db) => {
    const row = await repo.lock(db, input.parentId);           // SELECT … FOR UPDATE
    if (!row) throw notFound("… topilmadi");
    if (breaksRule(row, input)) throw conflict("<uzbek reason + what to do>");
    return repo.insert(db, input);
  });
```

## Rules

- **Validation** at the edge with zod; `z.coerce` for numbers from forms/query. Lists use `pageOf(req)` (`page`, `limit ≤ 200`, `q`, `status`) and return `{ items, total, page, limit }`.
- **Authz** deny-by-default: every mutating route has `allow(...)`. Reads are secured by `requireAuth`. Public routes only under `/public/*`.
- **Errors** (Uzbek messages, user-actionable): 404 `notFound`, 409 `conflict` (rule broken / duplicate — `23505` auto-maps), 422 zod / business validation, 401 no session, 403 role. Never leak SQL or stack.
- **Status codes**: 200 read/update · 201 create · 204 delete/no body · 409 · 422.
- **Transactions**: any write touching > 1 row/table → `tx()`. Lock the guarding row. Stock and money changes are idempotent (`idempotency_key` or state check).
- **SQL**: parameterized `$1…` only. No string-built `WHERE` from user input. Index any new filter/sort column used in lists.
- **Migrations**: new file `00N_*.sql`, never edit an applied one. Add CHECK constraints for invariants.
- **Secrets** only from env via `core/config.ts`.
- No new framework, ORM, or empty "future" module.

## API checklist per endpoint

- [ ] zod schema with limits (`max` on strings, `min/max` on numbers).
- [ ] `allow(...)` roles match the business owner of the action.
- [ ] Rule violations → 409 with Uzbek reason; bad input → 422.
- [ ] Transaction + lock if multi-row.
- [ ] List: pagination + `q` search + `status` filter where the UI has Chips.
- [ ] Test cases listed in `docs/TESTING.md` (happy · 401/403 · 422 · 409).
