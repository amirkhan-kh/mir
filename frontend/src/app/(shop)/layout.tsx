import { Footer } from "@/features/storefront/Footer";
import { Header } from "@/features/storefront/Header";
import { MobileTabBar } from "@/features/storefront/MobileTabBar";
import { getStore, serverGet } from "@/shared/lib/server";
import type { Category } from "@/shared/lib/types";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [store, categories] = await Promise.all([getStore(), serverGet<Category[]>("/public/categories")]);
  return (
    <>
      <Header store={store} categories={categories ?? []} />
      <main className="mx-auto min-h-[60vh] w-full max-w-[1320px] px-4 pb-28 pt-4 sm:px-6 lg:pb-16">{children}</main>
      <Footer store={store} categories={categories ?? []} />
      <MobileTabBar />
    </>
  );
}
