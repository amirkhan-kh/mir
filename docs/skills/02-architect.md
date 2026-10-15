# 02 architect

Run before code for: new endpoint, table/column, screen, state transition, or cross-module rule. Skip for copy/style tweaks.

## Plan (write it in chat, ≤ 10 lines)

```
Folder:     backend/src/modules/<d>/{router,repository[,service]}.ts · frontend/src/features/<d>/…
Data:       table/columns + constraints (CHECK/UNIQUE/FK) + index for list filters
Write-path: route → zod schema → allow(roles) → service rule → repo SQL → tx/lock?
Read-path:  list shape { items,total,page,limit } · q · status
Fail-path:  401 · 403 · 404 · 409 <rule> · 422 <field>  (Uzbek messages)
Invariants: which ones from ARCHITECTURE.md are touched and how they stay true
UI:         screen pattern (list / modal form / detail) · states · labels
Tests:      matrix rows to add in TESTING.md (ID + S1/S2/S3)
```

Missing a fact that changes the plan → one question, stop. Otherwise proceed.

## Decide

- Rule spans > 1 table or needs a lock → `service.ts` + `tx()`. Else router + repository only.
- Money / stock change → idempotent (state check or `idempotency_key`) + movement/ledger row.
- New status field → explicit transition map (copy `orders/service.ts` `transitions`).
- Reuse `shared/ui` + `usePaged` + `api`. New primitive only if 2+ screens need it.
- File > ~300 lines → split by sub-screen or sub-resource, not by "layer".

## Reject

Repositories-of-repositories, DTO mappers, generic base classes, event buses, feature flags, caching layers, "utils" dumping grounds, new packages — unless the task explicitly needs them and has a permit.
