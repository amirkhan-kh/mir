import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/features/catalog/CatalogView";
import { getLang, getT } from "@/shared/i18n/server";
import { social } from "@/shared/lib/seo";
import { serverGet } from "@/shared/lib/server";
import type { Category } from "@/shared/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category, t, lang] = await Promise.all([serverGet<Category>(`/public/categories/${encodeURIComponent(slug)}`), getT(), getLang()]);
  if (!category) return { title: t.meta.categoryMissing };
  const description = t.meta.categoryDescription(category.name, category.product_count);
  return {
    title: category.name,
    description,
    alternates: { canonical: `/katalog/${category.slug}` },
    ...social(lang, category.name, description),
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const [sp, category, categories] = await Promise.all([
    searchParams,
    serverGet<Category>(`/public/categories/${encodeURIComponent(slug)}`),
    serverGet<Category[]>("/public/categories"),
  ]);
  if (!category) notFound();
  return <CatalogView sp={sp} category={category} categories={categories ?? []} />;
}
