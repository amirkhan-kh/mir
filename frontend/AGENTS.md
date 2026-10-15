# Frontend agent notes

Next.js 16 differs from older versions. Before using an API you remember, check `node_modules/next/dist/docs/`.

- Middleware is `src/proxy.ts` (export `proxy`), not `middleware.ts`.
- `params` and `searchParams` are Promises in pages and layouts — `await` them.
- `next/image`: `images.qualities` is required (we allow `[75, 90]`); `priority` is deprecated → use `preload`.
- Caching uses the previous model (no `cacheComponents`); storefront pages are `force-dynamic` so stock and prices are live.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
