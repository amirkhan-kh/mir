# 03 Lighthouse 100

Bar on every public URL you touch (`/`, `/login`): Performance, Accessibility, Best Practices, SEO = **100**, mobile and desktop.
`/admin/*` is behind auth: target A11y + Best Practices 100, Performance ≥ 90.

## Checklist

**SEO** — `export const metadata` per route: unique `title`, `description`, `alternates.canonical`, `openGraph` (title, description, image). `app/robots.ts` + `app/sitemap.ts`. One `h1`. Descriptive link text. `lang="uz"` on `<html>`.

**Performance** — Server components first; landing sections static. `next/image` with `width/height` or `fill` + `sizes`; hero image `priority`. `next/font` with `display: "swap"`, subset `latin` + `latin-ext`. No client JS for static sections; `motion`/`recharts` only in client leaves, lazy below the fold (`next/dynamic`). No layout shift: reserve space for images, fonts, charts. Inline SVG icons via `lucide-react` (tree-shaken).

**Accessibility** — Contrast ≥ 4.5:1 (text) / 3:1 (large, UI). Every input labeled (`Field label`). Icon buttons `aria-label`. Focus visible. `aria-expanded` on toggles (FAQ, mobile menu). Respect `prefers-reduced-motion` (hero carousel, motion). Tap targets ≥ 24px.

**Best Practices** — No console errors. HTTPS in prod. No deprecated APIs. Images correct aspect ratio. `poweredByHeader: false` (already set).

## Run (task 3.1 or "lighthouse" in prompt = permit)

```bash
cd frontend && npm run build && npm run start   # prod build, never dev
npx lighthouse http://localhost:3000/ --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lh-desktop.json --quiet --chrome-flags="--headless"
npx lighthouse http://localhost:3000/ --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lh-mobile.json --quiet --chrome-flags="--headless"
```

Read failing audits from JSON (`categories.*.score < 1` → `audits[*].score < 1`). Fix that route only. Rerun 3× — scores fluctuate; all 3 must be 100. Delete the JSON reports before finishing (don't commit them).

## Report

`Check: lighthouse / mobile 100·100·100·100, desktop 100·100·100·100 (3 runs)` — or the failing audit ids.
