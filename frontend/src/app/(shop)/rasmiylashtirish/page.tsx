import type { Metadata } from "next";
import { Breadcrumbs } from "@/features/catalog/CatalogView";
import { CheckoutForm } from "@/features/checkout/CheckoutForm";
import { getStore } from "@/shared/lib/server";

export const metadata: Metadata = { title: "Rasmiylashtirish", robots: { index: false } };

export default async function CheckoutPage() {
  const store = await getStore();
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: "Bosh sahifa" }, { href: "/savat", label: "Savat" }, { label: "Rasmiylashtirish" }]} />
      <h1 className="mb-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Buyurtmani rasmiylashtirish</h1>
      <CheckoutForm store={store} />
    </div>
  );
}
