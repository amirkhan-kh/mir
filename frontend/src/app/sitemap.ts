import type { MetadataRoute } from "next";
import { serverGet } from "@/shared/lib/server";
import { SITE_URL as site } from "@/shared/lib/site";
import type { Category, ProductList } from "@/shared/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    serverGet<Category[]>("/public/categories").catch(() => null),
    serverGet<ProductList>("/public/products?limit=60").catch(() => null),
  ]);
  return [
    { url: `${site}/`, changeFrequency: "daily", priority: 1 },
    { url: `${site}/katalog`, changeFrequency: "daily", priority: 0.8 },
    ...(categories ?? []).map((c) => ({ url: `${site}/katalog/${c.slug}`, priority: 0.7 })),
    ...(products?.items ?? []).map((p) => ({ url: `${site}/mahsulot/${p.slug}`, priority: 0.6 })),
  ];
}
