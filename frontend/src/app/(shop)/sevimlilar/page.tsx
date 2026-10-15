import type { Metadata } from "next";
import { FavoritesView } from "@/features/cart/FavoritesView";
import { getT } from "@/shared/i18n/server";
import { longestPlan } from "@/shared/lib/installment";
import { getStore } from "@/shared/lib/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).meta.favorites, robots: { index: false } };
}

export default async function FavoritesPage() {
  const [store, t] = await Promise.all([getStore(), getT()]);
  return (
    <div>
      <h1 className="mb-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t.meta.favorites}</h1>
      <FavoritesView plan={longestPlan(store.installment)} />
    </div>
  );
}
