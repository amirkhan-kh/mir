# Deploy

Only when the prompt asks (task `3.3` or "deploy"). Otherwise `Need permit: deploy`.

## Target

- One VPS with Docker Compose (`db`, `backend`, `frontend`) behind a reverse proxy (Caddy/Nginx) with HTTPS.
- Or: frontend on Vercel (`API_INTERNAL_URL` → API host), API as one process + managed PostgreSQL.

## Pre-flight (all must be true)

- [ ] `npm run typecheck` green in both packages; `npm run build` green in `frontend/`.
- [ ] `npm run test:e2e` green (`docs/TESTING.md` done bar) on the release commit.
- [ ] Lighthouse 100 on `/` and `/login` (`docs/skills/03-lighthouse.md`).
- [ ] `JWT_SECRET` = random ≥ 32 bytes, not the compose default.
- [ ] `SECRET_KEY` = random ≥ 32 bytes, set once and backed up — it encrypts integration credentials; changing it makes saved secrets unreadable (re-enter them).
- [ ] Public URL is HTTPS: integration inbound URLs (feeds, 1C, PBX) carry the token in the path.
- [ ] Payme / Click endpoint URLs registered in their cabinets point to the HTTPS prod host; run Payme Sandbox (test.paycom.uz) and Click test before switching Payme `Rejim` to "Ishchi".
- [ ] Didox: partner token from a Didox partnership agreement; first send on `Muhit = Test` (stage.goodsign.biz). Clients need `inn`, products `ikpu` + `package_code` before shipping.
- [ ] SAP Service Layer with self-signed cert → `NODE_EXTRA_CA_CERTS=/path/ca.pem` on the backend, never disable TLS checks.
- [ ] `ADMIN_PASSWORD` changed; `SEED_DEMO=false`; default `admin/admin123` and demo users absent.
- [ ] `CORS_ORIGIN` = exact prod origin. Cookie `secure` in prod.
- [ ] DB password not `mir`; DB port not public.
- [ ] `.env.example` in git with keys only; real `.env` never committed.

## Ship

1. Backup DB (`pg_dump`) if it holds data.
2. Build images, start: migrations run on backend boot (`core/migrate.ts`) — forward-only.
3. Verify: `GET /health` → `{ ok: true }`, login works, one order flow S1 by hand or `@smoke` tests against prod URL.
4. Report URL, commit, health result.

## Rollback

Previous image tag + restore `pg_dump` if a migration broke data. Never `down -v` on prod.
No surprise SSH: every remote command must be named in the prompt or plan the user approved.
