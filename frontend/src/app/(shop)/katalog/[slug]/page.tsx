import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/features/catalog/CatalogView";
import { serverGet } from "@/shared/lib/server";
import type { Category } from "@/shared/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await serverGet<Category>(`/public/categories/${encodeURIComponent(slug)}`);
  if (!category) return { title: "Kategoriya topilmadi" };
  return {
    title: category.name,
    description: `${category.name} — Mir do'konida ${category.product_count} ta tovar. Rasmiy kafolat va tez yetkazib berish.`,
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
