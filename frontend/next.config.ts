import type { NextConfig } from "next";

const onVercel = Boolean(process.env.VERCEL);
const api = (process.env.API_INTERNAL_URL ?? "http://localhost:4010").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Docker runs the standalone server; Vercel uses its own build output.
  output: onVercel ? undefined : "standalone",
  poweredByHeader: false,
  async rewrites() {
    // On Vercel the root vercel.json decides whether /api goes to the backend service or the mock route.
    if (onVercel || process.env.MOCK_API === "1") return [];
    // beforeFiles so the real API wins over the mock route at app/api/v1.
    return {
      beforeFiles: [
        { source: "/api/v1/:path*", destination: `${api}/api/v1/:path*` },
        { source: "/uploads/:path*", destination: `${api}/uploads/:path*` },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  images: {
    // /_next/image returns 404 under Vercel Services; images are pre-sized webp, so serve them as-is there.
    unoptimized: onVercel,
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
