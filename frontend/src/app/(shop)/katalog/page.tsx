import type { Metadata } from "next";
import { CatalogView } from "@/features/catalog/CatalogView";
import { serverGet } from "@/shared/lib/server";
import type { Category } from "@/shared/lib/types";

export const metadata: Metadata = {
  title: "Katalog",
  description: "Smartfonlar, noutbuklar, planshetlar, audio va oshxona texnikasi — Mir katalogi.",
  alternates: { canonical: "/katalog" },
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [sp, categories] = await Promise.all([searchParams, serverGet<Category[]>("/public/categories")]);
  return <CatalogView sp={sp} category={null} categories={categories ?? []} />;
}
