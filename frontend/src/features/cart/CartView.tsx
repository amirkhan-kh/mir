"use client";

import { AlertCircle, ArrowRight, ImageOff, ShoppingBag, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useT } from "@/shared/i18n/client";
import { formatMoney } from "@/shared/lib/format";
import { ButtonLink } from "@/shared/ui/Button";
import { Empty } from "@/shared/ui/States";
import { QtyStepper } from "./CartButtons";
import { clearCart, removeFromCart, useCart } from "./store";
import { useQuote } from "./useQuote";

export function CartView() {
  const t = useT();
  const lines = useCart();
  const { quote, problems } = useQuote(lines);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = quote?.subtotal ?? lines.reduce((s, l) => s + l.price * l.qty, 0);
  const freeFrom = quote?.free_delivery_from ?? 0;
  const left = Math.max(0, freeFrom - subtotal);

  if (!lines.length) {
    return (
      <div className="rounded-3xl bg-white">
        <Empty
          icon={<ShoppingBag className="size-6" aria-hidden />}
          title={t.cart.empty}
          hint={t.cart.emptyHint}
          action={<ButtonLink href="/katalog">{t.cart.start}</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section aria-label={t.cart.items} className="rounded-3xl bg-white p-2 sm:p-4">
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <p className="text-sm text-ink-500">{t.cart.count(count)}</p>
          <button
            type="button"
            onClick={() => confirm(t.cart.clearConfirm) && clearCart()}
            className="text-sm font-semibold text-ink-500 hover:text-flame-600"
          >
            {t.cart.clear}
          </button>
        </div>
        <ul className="divide-y divide-ink-100">
          {lines.map((l) => {
            const q = quote?.items.find((i) => i.product_id === l.id);
            const max = Math.min(99, q?.stock ?? l.stock);
            return (
              <li key={l.id} className="flex gap-3 p-2 py-4 sm:gap-4">
                <Link href={`/mahsulot/${l.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-ink-50 sm:size-28">
                  {l.image ? (
                    <Image src={l.image} alt={l.name} fill sizes="112px" className="object-contain p-2 mix-blend-multiply" />
                  ) : (
                    <ImageOff className="m-auto mt-9 size-6 text-ink-300" aria-hidden />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link href={`/mahsulot/${l.slug}`} className="line-clamp-2 text-[15px] font-medium text-ink-900 hover:text-leaf-700">
                      {l.name}
                    </Link>
                    <p className="text-xs text-ink-500">{t.cart.perUnit(formatMoney(l.price))}</p>
                    {q?.problem ? (
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-flame-600">
                        <AlertCircle className="size-4" aria-hidden />
                        {q.problem}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="font-display text-lg font-semibold text-ink-950">{formatMoney(l.price * l.qty)}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-32">
                        <QtyStepper id={l.id} qty={l.qty} max={Math.max(1, max)} name={l.name} size="sm" />
                      </div>
                      <button type="button" aria-label={t.cart.remove(l.name)} onClick={() => removeFromCart(l.id)} className="grid size-10 place-items-center rounded-xl text-ink-400 hover:bg-flame-50 hover:text-flame-600">
                        <Trash2 className="size-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside aria-label={t.cart.summary} className="lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-4 rounded-3xl bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">{t.cart.yourOrder}</h2>
          {freeFrom > 0 ? (
            <div className="rounded-2xl bg-ink-50 p-3.5">
              <p className="flex items-center gap-2 text-sm font-medium text-ink-800">
                <Truck className="size-4.5 text-leaf-600" aria-hidden />
                {left > 0 ? (
                  <span>
                    {t.cart.untilFree} <b>{formatMoney(left)}</b>
                  </span>
                ) : (
                  <span className="font-semibold text-leaf-700">{t.cart.freeDelivery}</span>
                )}
              </p>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-ink-200" role="progressbar" aria-label={t.cart.freeProgress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(1, subtotal / freeFrom) * 100)}>
                <div className="brand-gradient h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(1, subtotal / freeFrom) * 100}%` }} />
              </div>
            </div>
          ) : null}
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">{t.cart.goods(count)}</dt>
              <dd className="font-medium">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">{t.common.delivery}</dt>
              <dd className="font-medium">{quote ? (quote.delivery_fee ? formatMoney(quote.delivery_fee) : t.common.free) : "—"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
              <dt className="font-semibold text-ink-900">{t.common.total}</dt>
              <dd className="font-display text-2xl font-bold text-ink-950">{formatMoney(subtotal + (quote?.delivery_fee ?? 0))}</dd>
            </div>
          </dl>
          {quote?.installment.length ? (
            <p className="rounded-xl bg-lime-100 px-3 py-2 text-sm text-ink-800">
              {t.cart.or} <b>{formatMoney(quote.installment[quote.installment.length - 1].monthly)}</b> {t.cart.installmentSuffix(quote.installment[quote.installment.length - 1].months)}
            </p>
          ) : null}
          {problems.length ? (
            <p role="alert" className="text-sm font-medium text-flame-600">
              {t.cart.problems}
            </p>
          ) : null}
          <ButtonLink
            href="/rasmiylashtirish"
            size="lg"
            className={`w-full ${problems.length ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={problems.length > 0}
          >
            {t.cart.checkout}
            <ArrowRight className="size-4.5" aria-hidden />
          </ButtonLink>
          <p className="text-center text-xs text-ink-500">{t.cart.payOnDelivery}</p>
        </div>
      </aside>
    </div>
  );
}
