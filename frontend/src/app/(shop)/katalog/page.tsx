import type { Metadata } from "next";
import { CatalogView } from "@/features/catalog/CatalogView";
import { getT } from "@/shared/i18n/server";
import { serverGet } from "@/shared/lib/server";
import type { Category } from "@/shared/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.meta.catalog, description: t.meta.catalogDescription, alternates: { canonical: "/katalog" } };
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [sp, categories] = await Promise.all([searchParams, serverGet<Category[]>("/public/categories")]);
  return <CatalogView sp={sp} category={null} categories={categories ?? []} />;
}
