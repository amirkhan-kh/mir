"use client";

import { CheckCircle2, PackageCheck, ShoppingBag, TrendingUp } from "lucide-react";
import { useState } from "react";
import { addToCart, useCart } from "@/features/cart/store";
import { BuyButtons } from "@/features/cart/CartButtons";
import { useT } from "@/shared/i18n/client";
import { discountPercent, formatMoney } from "@/shared/lib/format";
import { monthly } from "@/shared/lib/installment";
import type { InstallmentPlan, ProductDetail } from "@/shared/lib/types";

export function BuyBox({ product: p, plans }: { product: ProductDetail; plans: InstallmentPlan[] }) {
  const t = useT();
  const sorted = [...plans].sort((a, b) => b.months - a.months);
  const [months, setMonths] = useState(sorted[0]?.months ?? 0);
  const plan = sorted.find((x) => x.months === months);
  const off = discountPercent(p.price, p.old_price);

  return (
    <div className="space-y-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100 sm:p-6">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-display text-[32px] font-bold leading-none tracking-tight text-ink-950">{formatMoney(p.price)}</p>
          {off ? <span className="rounded-lg bg-flame-500 px-2 py-0.5 text-sm font-bold text-white">−{off}%</span> : null}
        </div>
        {p.old_price ? (
          <p className="mt-1.5 text-sm text-ink-400">
            <span className="line-through">{formatMoney(p.old_price)}</span>
            <span className="ml-2 font-semibold text-flame-600">{t.product.save(formatMoney(p.old_price - p.price))}</span>
          </p>
        ) : null}
      </div>

      {sorted.length && p.stock > 0 ? (
        <div className="rounded-2xl bg-ink-50 p-3">
          <div role="tablist" aria-label={t.product.installment} className="grid gap-1 rounded-xl bg-white p-1" style={{ gridTemplateColumns: `repeat(${sorted.length}, minmax(0, 1fr))` }}>
            {sorted.map((x) => (
              <button
                key={x.months}
                type="button"
                role="tab"
                aria-selected={x.months === months}
                onClick={() => setMonths(x.months)}
                className={`h-9 rounded-lg text-sm font-semibold transition-colors ${x.months === months ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-ink-100"}`}
              >
                {t.common.months(x.months)}
              </button>
            ))}
          </div>
          {plan ? (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-700">
              <span className="rounded-lg bg-lime-300 px-2 py-1 font-display text-base font-bold text-ink-950">{formatMoney(monthly(p.price, plan))}</span>
              × {t.common.months(plan.months)}
              <span className="w-full text-xs text-ink-500">
                {plan.percent === 0 ? t.product.noMarkup : t.product.markup(plan.percent)}
                {t.product.atCheckout}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      <BuyButtons product={p} />

      <ul className="space-y-2 text-sm">
        {p.stock > 0 ? (
          <li className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${p.stock <= 3 ? "bg-amber-50 text-amber-600" : "bg-lime-100 text-leaf-700"}`}>
            <CheckCircle2 className="size-4.5 shrink-0" aria-hidden />
            <span className="font-semibold">{p.stock <= 3 ? (p.stock === 1 ? t.product.lastOne : t.product.lastN(p.stock)) : t.product.inStock(p.stock)}</span>
          </li>
        ) : null}
        {p.sold_count > 0 ? (
          <li className="flex items-center gap-2.5 px-3 text-ink-600">
            <TrendingUp className="size-4.5 shrink-0 text-leaf-600" aria-hidden />
            {t.product.bought(p.sold_count)}
          </li>
        ) : null}
        <li className="flex items-center gap-2.5 px-3 text-ink-600">
          <PackageCheck className="size-4.5 shrink-0 text-leaf-600" aria-hidden />
          {t.product.warranty(p.warranty_months)}
        </li>
      </ul>
    </div>
  );
}

/** Mobile sticky footer on the product page. */
export function MobileBuyBar({ product: p }: { product: ProductDetail }) {
  const t = useT();
  const inCart = useCart().some((l) => l.id === p.id);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-ink-100 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
      <div className="min-w-0 flex-1">
        {p.old_price ? <p className="text-xs text-ink-400 line-through">{formatMoney(p.old_price)}</p> : null}
        <p className="font-display text-lg font-bold text-ink-950">{formatMoney(p.price)}</p>
      </div>
      {p.stock <= 0 ? (
        <span className="rounded-xl bg-ink-100 px-4 py-3 text-sm font-semibold text-ink-500">{t.card.outOfStock}</span>
      ) : inCart ? (
        <a href="/savat" className="flex h-12 items-center gap-2 rounded-xl bg-ink-950 px-5 font-semibold text-white">
          {t.card.goToCart}
        </a>
      ) : (
        <button type="button" onClick={() => addToCart(p)} className="flex h-12 items-center gap-2 rounded-xl bg-lime-400 px-5 font-semibold text-ink-950">
          <ShoppingBag className="size-4.5" aria-hidden />
          {t.card.addToCartLong}
        </button>
      )}
    </div>
  );
}
