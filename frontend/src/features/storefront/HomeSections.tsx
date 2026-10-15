import { ArrowRight, BadgeCheck, CreditCard, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getT } from "@/shared/i18n/server";
import { formatMoney } from "@/shared/lib/format";
import type { Banner, Category, InstallmentPlan, ProductCard as Product, Store } from "@/shared/lib/types";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { ProductCard } from "./ProductCard";

export async function CategoryTiles({ categories }: { categories: Category[] }) {
  const t = await getT();
  return (
    <section aria-labelledby="cat-title">
      <h2 id="cat-title" className="sr-only">
        {t.nav.categories}
      </h2>
      <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 md:grid-cols-6">
        {categories.map((c) => (
          <li key={c.id} className="shrink-0">
            <Link
              href={`/katalog/${c.slug}`}
              className="group flex h-full w-28 flex-col items-center gap-2.5 rounded-2xl bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-card sm:w-auto sm:p-4"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-lime-100 text-leaf-700 transition-colors group-hover:bg-lime-400 group-hover:text-ink-950">
                <CategoryIcon name={c.icon} className="size-6" />
              </span>
              <span className="text-[13px] font-semibold leading-tight text-ink-900">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function Benefits({ store }: { store: Store }) {
  const t = await getT();
  const maxPlan = store.installment.reduce((m, p) => Math.max(m, p.months), 0);
  const items = [
    { icon: Truck, title: t.home.courierTitle, text: t.home.courierText(formatMoney(store.free_delivery_from)) },
    { icon: CreditCard, title: t.home.installmentTitle, text: maxPlan ? t.home.installmentText(maxPlan) : t.home.installmentNone },
    { icon: ShieldCheck, title: t.home.warrantyTitle, text: t.home.warrantyText },
    { icon: BadgeCheck, title: t.home.originalTitle, text: t.home.originalText },
  ];
  return (
    <section aria-label={t.home.benefits} className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {items.map((i) => (
        <div key={i.title} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 sm:p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink-950 text-lime-400">
            <i.icon className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink-950">{i.title}</span>
            <span className="block text-xs leading-snug text-ink-500">{i.text}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

export async function ProductRail({
  title,
  href,
  products,
  plan,
  accent,
}: {
  title: string;
  href: string;
  products: Product[];
  plan: InstallmentPlan | null;
  accent?: string;
}) {
  if (!products.length) return null;
  const t = await getT();
  return (
    <section aria-labelledby={`rail-${href}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id={`rail-${href}`} className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-ink-950 sm:text-2xl">
          {accent ? <span className="rounded-lg bg-flame-500 px-2 py-0.5 text-sm font-bold text-white">{accent}</span> : null}
          {title}
        </h2>
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-leaf-700 hover:text-ink-950">
          {t.home.viewAll}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <ul className="scrollbar-none -mx-4 flex snap-x gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:px-0 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <li key={p.id} className="w-[46vw] max-w-56 shrink-0 snap-start sm:w-auto sm:max-w-none">
            <ProductCard product={p} plan={plan} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function PromoBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  const t = await getT();
  return (
    <section aria-label={t.home.promo} className="grid gap-3 md:grid-cols-2">
      {banners.map((b) => {
        const dark = b.theme === "dark";
        const cls = dark ? "bg-ink-950 text-white" : b.theme === "lime" ? "brand-gradient text-ink-950" : "bg-white text-ink-950";
        const inner = (
          <div className={`group relative flex h-48 overflow-hidden rounded-3xl p-6 sm:h-56 sm:p-8 ${cls}`}>
            <div className="relative z-10 flex max-w-[58%] flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-bold leading-tight sm:text-2xl">{b.title}</h3>
                {b.subtitle ? <p className={`mt-2 text-sm ${dark ? "text-ink-300" : "text-ink-700"}`}>{b.subtitle}</p> : null}
              </div>
              {b.cta ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  {b.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              ) : null}
            </div>
            {b.image ? (
              <div className="absolute -right-4 bottom-0 top-0 w-1/2">
                <div className={`absolute inset-8 rounded-full blur-2xl ${dark ? "bg-lime-400/25" : "bg-white/60"}`} aria-hidden />
                <Image src={b.image} alt="" fill sizes="(min-width: 768px) 320px, 50vw" className="object-contain p-5 transition-transform duration-500 group-hover:scale-105" />
              </div>
            ) : null}
          </div>
        );
        return b.link ? (
          <Link key={b.id} href={b.link} aria-label={b.title}>
            {inner}
          </Link>
        ) : (
          <div key={b.id}>{inner}</div>
        );
      })}
    </section>
  );
}
