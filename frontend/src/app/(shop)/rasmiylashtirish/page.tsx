import type { Metadata } from "next";
import { Breadcrumbs } from "@/features/catalog/CatalogView";
import { CheckoutForm } from "@/features/checkout/CheckoutForm";
import { getT } from "@/shared/i18n/server";
import { getStore } from "@/shared/lib/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).meta.checkout, robots: { index: false } };
}

export default async function CheckoutPage() {
  const [store, t] = await Promise.all([getStore(), getT()]);
  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: t.nav.home }, { href: "/savat", label: t.nav.cart }, { label: t.checkout.breadcrumb }]} />
      <h1 className="mb-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{t.meta.checkout}</h1>
      <CheckoutForm store={store} />
    </div>
  );
}
