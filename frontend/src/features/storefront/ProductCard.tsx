"use client";

import { ImageOff, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton, FavoriteButton } from "@/features/cart/CartButtons";
import { useT } from "@/shared/i18n/client";
import { discountPercent, formatMoney } from "@/shared/lib/format";
import { monthly } from "@/shared/lib/installment";
import type { InstallmentPlan, ProductCard as Product } from "@/shared/lib/types";

export function ProductCard({ product: p, plan, preload = false }: { product: Product; plan: InstallmentPlan | null; preload?: boolean }) {
  const t = useT();
  const off = discountPercent(p.price, p.old_price);
  const out = p.stock <= 0;
  const [img, img2] = p.images;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-shadow duration-300 hover:shadow-lift">
      <Link href={`/mahsulot/${p.slug}`} className="relative block aspect-square overflow-hidden bg-ink-50" aria-label={p.name}>
        {img ? (
          <>
            <Image
              src={img}
              alt={p.name}
              fill
              preload={preload}
              sizes="(min-width: 1280px) 240px, (min-width: 768px) 30vw, 50vw"
              className={`object-contain mix-blend-multiply transition duration-500 ${img2 ? "group-hover:opacity-0" : "group-hover:scale-105"} ${out ? "opacity-50 grayscale" : ""}`}
            />
            {img2 ? (
              <Image src={img2} alt="" fill sizes="(min-width: 1280px) 240px, 50vw" className="object-contain opacity-0 mix-blend-multiply transition duration-500 group-hover:opacity-100" />
            ) : null}
          </>
        ) : (
          <span className="grid h-full place-items-center text-ink-300">
            <ImageOff className="size-10" aria-hidden />
          </span>
        )}
        <span className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {off ? <span className="rounded-lg bg-flame-500 px-2 py-0.5 text-xs font-bold text-white">−{off}%</span> : null}
          {p.badge ? <span className="rounded-lg bg-ink-950 px-2 py-0.5 text-xs font-bold text-lime-300">{p.badge}</span> : null}
        </span>
        {out ? (
          <span className="absolute inset-x-2 bottom-2 rounded-lg bg-ink-950/80 py-1 text-center text-xs font-semibold text-white">{t.card.outOfStock}</span>
        ) : p.stock <= 3 ? (
          <span className="absolute inset-x-2 bottom-2 rounded-lg bg-amber-50/95 py-1 text-center text-xs font-semibold text-amber-600">
            {t.card.lastN(p.stock)}
          </span>
        ) : null}
      </Link>
      <FavoriteButton id={p.id} name={p.name} className="absolute right-2 top-2" />

      <div className="flex flex-1 flex-col gap-1 px-2 pb-2 pt-2">
        <Link href={`/mahsulot/${p.slug}`} className="line-clamp-2 min-h-9 text-[13px] font-medium leading-[18px] text-ink-900 hover:text-leaf-700">
          {p.name}
        </Link>
        <p className="flex items-center gap-1 text-[11px] text-ink-500">
          {p.rating_count > 0 ? (
            <>
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
              <span className="font-semibold text-ink-800">{Number(p.rating_avg).toFixed(1)}</span>
              <span>{t.card.reviews(p.rating_count)}</span>
            </>
          ) : (
            <span>{t.card.noReviews}</span>
          )}
        </p>
        {plan && !out ? (
          <p className="w-fit rounded bg-lime-200 px-1 text-[11px] font-semibold leading-[18px] text-ink-900">
            {formatMoney(monthly(p.price, plan))} {t.card.perMonth(plan.months)}
          </p>
        ) : null}
        <p className="mt-auto flex flex-wrap items-baseline gap-x-1.5">
          <span className="font-display text-base font-semibold tracking-tight text-ink-950">{formatMoney(p.price)}</span>
          {p.old_price ? <span className="text-[11px] text-ink-400 line-through">{formatMoney(p.old_price)}</span> : null}
        </p>
        <div className="pt-1">
          <AddToCartButton product={p} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, plan, preloadFirst = 0 }: { products: Product[]; plan: InstallmentPlan | null; preloadFirst?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} plan={plan} preload={i < preloadFirst} />
        </li>
      ))}
    </ul>
  );
}
