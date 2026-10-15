import type { NextConfig } from "next";

const onVercel = Boolean(process.env.VERCEL);

if (onVercel && !process.env.API_INTERNAL_URL) {
  throw new Error("API_INTERNAL_URL must be set in Vercel project env (public HTTPS URL of the Mir API).");
}

const api = (process.env.API_INTERNAL_URL ?? "http://localhost:4010").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Docker runs the standalone server; Vercel uses its own build output.
  output: onVercel ? undefined : "standalone",
  poweredByHeader: false,
  async rewrites() {
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
