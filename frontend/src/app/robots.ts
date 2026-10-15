import type { MetadataRoute } from "next";
import { SITE_URL as site } from "@/shared/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/savat", "/rasmiylashtirish", "/buyurtma"] },
    sitemap: `${site}/sitemap.xml`,
  };
}
