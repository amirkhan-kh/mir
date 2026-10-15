import { HeroCarousel } from "@/features/storefront/HeroCarousel";
import { Benefits, CategoryTiles, ProductRail, PromoBanners } from "@/features/storefront/HomeSections";
import { longestPlan } from "@/features/storefront/ProductCard";
import { getStore, serverGet } from "@/shared/lib/server";
import type { Banner, Category, ProductList } from "@/shared/lib/types";

export default async function HomePage() {
  const [store, banners, categories, featured, discounted, fresh] = await Promise.all([
    getStore(),
    serverGet<Banner[]>("/public/banners"),
    serverGet<Category[]>("/public/categories"),
    serverGet<ProductList>("/public/products?featured=1&limit=10&sort=popular"),
    serverGet<ProductList>("/public/products?discount=1&limit=10&sort=discount&in_stock=1"),
    serverGet<ProductList>("/public/products?sort=new&limit=10&in_stock=1"),
  ]);
  const plan = longestPlan(store.installment);
  const hero = (banners ?? []).filter((b) => b.placement === "hero");
  const promo = (banners ?? []).filter((b) => b.placement === "promo");

  return (
    <div className="space-y-8 sm:space-y-12">
      <h1 className="sr-only">Mir — maishiy texnika va elektronika do'koni</h1>
      <HeroCarousel banners={hero} />
      <CategoryTiles categories={(categories ?? []).filter((c) => c.product_count > 0)} />
      <ProductRail title="Ommabop tovarlar" href="/katalog?featured=1" products={featured?.items ?? []} plan={plan} />
      <Benefits store={store} />
      <ProductRail title="Chegirmalar" accent="%" href="/katalog?discount=1&sort=discount" products={discounted?.items ?? []} plan={plan} />
      <PromoBanners banners={promo} />
      <ProductRail title="Yangi kelganlar" href="/katalog?sort=new" products={fresh?.items ?? []} plan={plan} />
    </div>
  );
}
