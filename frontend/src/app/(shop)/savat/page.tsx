import type { Metadata } from "next";
import { CartView } from "@/features/cart/CartView";
import { getT } from "@/shared/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).meta.cart, robots: { index: false } };
}

export default async function CartPage() {
  const t = await getT();
  return (
    <div>
      <h1 className="mb-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t.meta.cart}</h1>
      <CartView />
    </div>
  );
}
