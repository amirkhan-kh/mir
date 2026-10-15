import type { NextConfig } from "next";

const onVercel = Boolean(process.env.VERCEL);
const api = (process.env.API_INTERNAL_URL ?? "http://localhost:4010").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Docker runs the standalone server; Vercel uses its own build output.
  output: onVercel ? undefined : "standalone",
  poweredByHeader: false,
  async rewrites() {
    // On Vercel the root vercel.json routes /api and /uploads to the backend service before Next sees them.
    if (onVercel) return [];
    return [
      { source: "/api/v1/:path*", destination: `${api}/api/v1/:path*` },
      { source: "/uploads/:path*", destination: `${api}/uploads/:path*` },
    ];
  },
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
