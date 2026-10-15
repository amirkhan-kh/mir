import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/features/catalog/CatalogView";
import { getT } from "@/shared/i18n/server";
import { serverGet } from "@/shared/lib/server";
import type { Category } from "@/shared/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category, t] = await Promise.all([serverGet<Category>(`/public/categories/${encodeURIComponent(slug)}`), getT()]);
  if (!category) return { title: t.meta.categoryMissing };
  return {
    title: category.name,
    description: t.meta.categoryDescription(category.name, category.product_count),
    alternates: { canonical: `/katalog/${category.slug}` },
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
