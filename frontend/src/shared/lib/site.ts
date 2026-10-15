const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

/** Public origin for metadata, sitemap and robots. `SITE_URL` wins; Vercel's production host is the fallback. */
export const SITE_URL = (
  process.env.SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3010")
).replace(/\/+$/, "");
