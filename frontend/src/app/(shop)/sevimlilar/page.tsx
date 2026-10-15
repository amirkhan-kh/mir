import type { Metadata } from "next";
import { FavoritesView } from "@/features/cart/FavoritesView";
import { longestPlan } from "@/features/storefront/ProductCard";
import { getStore } from "@/shared/lib/server";

export const metadata: Metadata = { title: "Sevimlilar", robots: { index: false } };

export default async function FavoritesPage() {
  const store = await getStore();
  return (
    <div>
      <h1 className="mb-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Sevimlilar</h1>
      <FavoritesView plan={longestPlan(store.installment)} />
    </div>
  );
}
