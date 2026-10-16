import { BadgeCheck, Store as StoreIcon, Truck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/features/cart/CartButtons";
import { Breadcrumbs } from "@/features/catalog/CatalogView";
import { BuyBox, MobileBuyBar } from "@/features/product/BuyBox";
import { ProductGallery } from "@/features/product/ProductGallery";
import { Reviews } from "@/features/product/Reviews";
import { ProductRail } from "@/features/storefront/HomeSections";
import { getLang, getT } from "@/shared/i18n/server";
import { longestPlan } from "@/shared/lib/installment";
import { formatMoney } from "@/shared/lib/format";
import { social } from "@/shared/lib/seo";
import { getStore, serverGet } from "@/shared/lib/server";
import type { ProductDetail } from "@/shared/lib/types";
import { Stars } from "@/shared/ui/Stars";

type Props = { params: Promise<{ slug: string }> };

const load = (slug: string) => serverGet<ProductDetail>(`/public/products/${encodeURIComponent(slug)}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [p, t, lang] = await Promise.all([params.then(({ slug }) => load(slug)), getT(), getLang()]);
  if (!p) return { title: t.meta.productMissing };
  const description = `${p.name} — ${formatMoney(p.price)}. ${p.short_description}`.slice(0, 160);
  return {
    title: p.name,
    description,
    alternates: { canonical: `/mahsulot/${p.slug}` },
    ...social(lang, p.name, description, p.images[0]),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p, store, t] = await Promise.all([load(slug), getStore(), getT()]);
  if (!p) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images,
    sku: p.sku ?? undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "KGS",
      price: p.price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: p.rating_count ? { "@type": "AggregateRating", ratingValue: p.rating_avg, reviewCount: p.rating_count } : undefined,
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div>
        <Breadcrumbs items={[{ href: "/", label: t.nav.home }, { href: "/katalog", label: t.nav.catalog }, { href: `/katalog/${p.category_slug}`, label: p.category_name }, { label: p.name }]} />

        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_360px]">
          <ProductGallery images={p.images} name={p.name} />

          <div className="space-y-4">
            <div>
              {p.brand ? <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-leaf-700">{p.brand}</p> : null}
              <div className="flex items-start gap-3">
                <h1 className="flex-1 font-display text-2xl font-semibold leading-tight tracking-tight text-ink-950 sm:text-[28px]">{p.name}</h1>
                <FavoriteButton id={p.id} name={p.name} className="shrink-0" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-500">
                {p.rating_count ? (
                  <a href="#sharhlar" className="flex items-center gap-1.5 hover:text-ink-950">
                    <Stars value={Number(p.rating_avg)} />
                    <span className="font-semibold text-ink-800">{Number(p.rating_avg).toFixed(1)}</span>
                    <span className="underline underline-offset-2">{t.product.reviews(p.rating_count)}</span>
                  </a>
                ) : (
                  <a href="#sharhlar" className="underline underline-offset-2 hover:text-ink-950">{t.product.leaveReview}</a>
                )}
                {p.sold_count ? <span>· {t.product.orders(p.sold_count)}</span> : null}
                {p.sku ? <span>· {t.product.sku(p.sku)}</span> : null}
              </div>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-leaf-700">
                <BadgeCheck className="size-3.5" aria-hidden />
                {t.product.original}
              </p>
            </div>
            {p.short_description ? <p className="text-[15px] leading-relaxed text-ink-700">{p.short_description}</p> : null}
            {p.specs.length ? (
              <div className="rounded-2xl bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-ink-950">{t.product.keySpecs}</h2>
                <dl className="space-y-2 text-sm">
                  {p.specs.slice(0, 6).map((s) => (
                    <div key={s.label} className="flex items-baseline gap-2">
                      <dt className="shrink-0 text-ink-500">{s.label}</dt>
                      <span className="flex-1 border-b border-dotted border-ink-200" aria-hidden />
                      <dd className="text-right font-medium text-ink-900">{s.value}</dd>
                    </div>
                  ))}
                </dl>
                {p.specs.length > 6 ? (
                  <a href="#xususiyatlar" className="mt-3 inline-block text-sm font-semibold text-leaf-700 hover:underline">
                    {t.product.allSpecs}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:col-span-2 md:grid-cols-2 lg:sticky lg:top-4 lg:col-span-1 lg:grid-cols-1 lg:self-start">
            <BuyBox product={p} plans={store.installment} />
            <div className="space-y-3 self-start rounded-3xl bg-white p-4 ring-1 ring-ink-100 sm:p-5">
              <h2 className="font-display text-base font-semibold">{t.product.delivery}</h2>
              <div className="flex gap-3">
                <Truck className="mt-0.5 size-5 shrink-0 text-leaf-600" aria-hidden />
                <div className="text-sm">
                  <p className="font-semibold text-ink-900">{t.product.ownCouriers}</p>
                  <p className="text-ink-500">
                    {store.delivery_note}. {p.price >= store.free_delivery_from ? t.product.freeForThis : t.product.deliveryCost(formatMoney(store.delivery_fee), formatMoney(store.free_delivery_from))}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <StoreIcon className="mt-0.5 size-5 shrink-0 text-leaf-600" aria-hidden />
                <div className="text-sm">
                  <p className="font-semibold text-ink-900">{t.product.pickup}</p>
                  <p className="text-ink-500">{store.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="tavsif" className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-4 sm:p-6">
          <h2 id="tavsif" className="mb-3 font-display text-lg font-semibold sm:text-xl">{t.product.description}</h2>
          <div className="space-y-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-700">{p.description || p.short_description}</div>
        </div>
        <div id="xususiyatlar" className="scroll-mt-6 rounded-3xl bg-white p-4 sm:p-6">
          <h2 className="mb-3 font-display text-lg font-semibold sm:text-xl">{t.product.specs}</h2>
          <dl className="divide-y divide-ink-100 text-sm">
            {p.specs.map((s) => (
              <div key={s.label} className="grid grid-cols-2 gap-4 py-2.5">
                <dt className="text-ink-500">{s.label}</dt>
                <dd className="font-medium text-ink-900">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="sharhlar" aria-labelledby="sharhlar-title" className="scroll-mt-6">
        <h2 id="sharhlar-title" className="mb-3 font-display text-xl font-semibold sm:text-2xl">
          {t.product.reviewsTitle}
        </h2>
        <Reviews product={p} />
      </section>

      <ProductRail title={t.product.similar} href={`/katalog/${p.category_slug}`} products={p.related} plan={longestPlan(store.installment)} />
      <MobileBuyBar product={p} />
    </div>
  );
}
