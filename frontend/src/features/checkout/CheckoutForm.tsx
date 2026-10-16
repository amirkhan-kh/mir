"use client";

import { Banknote, CalendarClock, CreditCard, ImageOff, Lock, Store as StoreIcon, Truck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { clearCart, useCart } from "@/features/cart/store";
import { useQuote } from "@/features/cart/useQuote";
import { api, ApiError } from "@/shared/lib/api";
import { useT } from "@/shared/i18n/client";
import { formatMoney } from "@/shared/lib/format";
import type { DeliveryMethod, PaymentMethod, Store } from "@/shared/lib/types";
import { Button, ButtonLink } from "@/shared/ui/Button";
import { Field, Input, Select, Textarea } from "@/shared/ui/Field";
import { Alert, Empty, Loading } from "@/shared/ui/States";

const PROFILE_KEY = "mir_customer";

function formatLocal(digits: string) {
  const d = digits.slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
}

function Option({ name, value, checked, onChange, icon, title, hint }: { name: string; value: string; checked: boolean; onChange: () => void; icon: ReactNode; title: string; hint: ReactNode }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${checked ? "border-ink-950 bg-lime-100/50" : "border-ink-100 bg-white hover:border-ink-300"}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${checked ? "bg-ink-950 text-lime-400" : "bg-ink-100 text-ink-600"}`}>{icon}</span>
      <span className="flex-1">
        <span className="block font-semibold text-ink-950">{title}</span>
        <span className="block text-sm text-ink-500">{hint}</span>
      </span>
      <span className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 ${checked ? "border-ink-950" : "border-ink-300"}`} aria-hidden>
        {checked ? <span className="size-2.5 rounded-full bg-ink-950" /> : null}
      </span>
    </label>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 font-display text-lg font-semibold">
        <span className="grid size-8 place-items-center rounded-full bg-lime-400 text-sm font-bold text-ink-950">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckoutForm({ store }: { store: Store }) {
  const t = useT();
  const router = useRouter();
  const lines = useCart();
  const { quote, problems } = useQuote(lines);
  const [delivery, setDelivery] = useState<DeliveryMethod>("courier");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [months, setMonths] = useState<number>(store.installment[store.installment.length - 1]?.months ?? 0);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const idem = useRef<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null");
      if (saved) {
        setName(saved.name ?? "");
        setPhone(saved.phone ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (done) return <Loading label={t.checkout.redirecting} />;
  if (!lines.length) {
    return (
      <div className="rounded-3xl bg-white">
        <Empty title={t.checkout.empty} hint={t.checkout.emptyHint} action={<ButtonLink href="/katalog">{t.favorites.toCatalog}</ButtonLink>} />
      </div>
    );
  }

  const subtotal = quote?.subtotal ?? 0;
  const fee = delivery === "courier" && subtotal < store.free_delivery_from ? store.delivery_fee : 0;
  const plan = quote?.installment.find((p) => p.months === months);
  const total = payment === "installment" && plan ? plan.total + fee : subtotal + fee;
  const monthlyPay = payment === "installment" && plan ? Math.ceil(total / plan.months) : null;
  const count = lines.reduce((s, l) => s + l.qty, 0);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    const f = new FormData(e.currentTarget);
    if (phone.replace(/\D/g, "").length !== 9) {
      setError(t.checkout.phoneError);
      return;
    }
    idem.current ??= crypto.randomUUID();
    setSaving(true);
    setError(null);
    try {
      const order = await api<{ number: string; phone: string }>("/public/orders", {
        method: "POST",
        json: {
          idempotency_key: idem.current,
          customer_name: name,
          phone: `+998${phone.replace(/\D/g, "")}`,
          region: delivery === "courier" ? f.get("region") : t.checkout.pickupRegion,
          address: delivery === "courier" ? f.get("address") : "",
          comment: f.get("comment") ?? "",
          delivery_method: delivery,
          payment_method: payment,
          installment_months: payment === "installment" ? months : null,
          items: lines.map((l) => ({ product_id: l.id, qty: l.qty })),
        },
      });
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, phone }));
      sessionStorage.setItem("mir_last_order", JSON.stringify({ number: order.number, phone: order.phone, fresh: true }));
      setDone(true);
      clearCart();
      router.replace(`/buyurtma/${order.number}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) idem.current = null;
      setError(err instanceof ApiError ? err.message : t.common.error);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_400px]" noValidate={false}>
      <div className="space-y-4">
        <Step n={1} title={t.checkout.contacts}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.checkout.fullName}>
              {(id) => <Input id={id} name="customer_name" required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.checkout.namePlaceholder} />}
            </Field>
            <Field label={t.checkout.phone} hint={t.checkout.phoneHint}>
              {(id) => (
                <div className="flex h-11 items-center rounded-xl border border-ink-200 bg-white focus-within:border-leaf-600 focus-within:ring-4 focus-within:ring-lime-300/40">
                  <span className="pl-3.5 pr-1 text-[15px] font-medium text-ink-600">+998</span>
                  <input
                    id={id}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    required
                    placeholder="90 123 45 67"
                    value={formatLocal(phone)}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").replace(/^998/, "").slice(0, 9))}
                    className="h-full flex-1 rounded-r-xl bg-transparent pr-3 text-[15px] focus:outline-none"
                  />
                </div>
              )}
            </Field>
          </div>
        </Step>

        <Step n={2} title={t.checkout.receive}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Option name="delivery" value="courier" checked={delivery === "courier"} onChange={() => setDelivery("courier")} icon={<Truck className="size-5" />} title={t.checkout.courier} hint={subtotal >= store.free_delivery_from ? t.common.free : t.checkout.courierHint(formatMoney(store.delivery_fee), formatMoney(store.free_delivery_from))} />
            <Option name="delivery" value="pickup" checked={delivery === "pickup"} onChange={() => setDelivery("pickup")} icon={<StoreIcon className="size-5" />} title={t.checkout.pickup} hint={t.common.free} />
          </div>
          {delivery === "courier" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr]">
              <Field label={t.checkout.region}>
                {(id) => (
                  <Select id={id} name="region" required defaultValue={store.regions[0]}>
                    {store.regions.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label={t.checkout.address} hint={t.checkout.addressHint}>
                {(id) => <Input id={id} name="address" required minLength={5} maxLength={240} autoComplete="street-address" placeholder={t.checkout.addressPlaceholder} />}
              </Field>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl bg-ink-50 p-4 text-sm text-ink-700">
              <b>{t.checkout.addressLabel}</b> {store.address}. <b>{t.checkout.hoursLabel}</b> {store.hours}. {t.checkout.pickupNote}
            </p>
          )}
        </Step>

        <Step n={3} title={t.checkout.payment}>
          <div className="grid gap-3">
            <Option name="payment" value="cash" checked={payment === "cash"} onChange={() => setPayment("cash")} icon={<Banknote className="size-5" />} title={t.checkout.cash} hint={t.checkout.cashHint} />
            <Option name="payment" value="card" checked={payment === "card"} onChange={() => setPayment("card")} icon={<CreditCard className="size-5" />} title={t.checkout.card} hint={t.checkout.cardHint} />
            {store.installment.length ? (
              <Option name="payment" value="installment" checked={payment === "installment"} onChange={() => setPayment("installment")} icon={<CalendarClock className="size-5" />} title={t.checkout.installment} hint={t.checkout.installmentHint} />
            ) : null}
          </div>
          {payment === "installment" && quote ? (
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-semibold text-ink-800">{t.checkout.chooseTerm}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {quote.installment.map((p) => (
                  <label key={p.months} className={`cursor-pointer rounded-2xl border-2 p-3 text-center transition-colors ${months === p.months ? "border-ink-950 bg-lime-200" : "border-ink-100 hover:border-ink-300"}`}>
                    <input type="radio" name="months" className="sr-only" checked={months === p.months} onChange={() => setMonths(p.months)} />
                    <span className="block font-display text-lg font-bold">{t.common.months(p.months)}</span>
                    <span className="block text-xs font-semibold text-ink-700">{formatMoney(Math.ceil((p.total + fee) / p.months))}{t.checkout.perMonth}</span>
                    <span className="block text-[11px] text-ink-500">{p.percent ? `+${p.percent}%` : t.checkout.noMarkup}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
        </Step>

        <Step n={4} title={t.checkout.comment}>
          <Field label={t.checkout.commentLabel}>
            {(id) => <Textarea id={id} name="comment" maxLength={500} placeholder={t.checkout.commentPlaceholder} />}
          </Field>
        </Step>
      </div>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        <div className="space-y-4 rounded-3xl bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">{t.checkout.yourOrder(count)}</h2>
          <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {lines.map((l) => {
              const q = quote?.items.find((i) => i.product_id === l.id);
              return (
                <li key={l.id} className="flex gap-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                    {l.image ? <Image src={l.image} alt="" fill sizes="56px" className="object-contain p-1 mix-blend-multiply" /> : <ImageOff className="m-auto mt-4 size-5 text-ink-300" aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="line-clamp-2 text-ink-900">{l.name}</span>
                    <span className="text-ink-500">
                      {l.qty} × {formatMoney(l.price)}
                    </span>
                    {q?.problem ? <span className="block font-semibold text-flame-600">{q.problem}</span> : null}
                  </span>
                </li>
              );
            })}
          </ul>
          <dl className="space-y-2.5 border-t border-ink-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">{t.common.goods}</dt>
              <dd className="font-medium">{formatMoney(subtotal)}</dd>
            </div>
            {payment === "installment" && plan && plan.percent ? (
              <div className="flex justify-between">
                <dt className="text-ink-500">{t.checkout.markup(plan.percent)}</dt>
                <dd className="font-medium">{formatMoney(plan.total - subtotal)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-ink-500">{t.common.delivery}</dt>
              <dd className="font-medium">{fee ? formatMoney(fee) : t.common.free}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
              <dt className="font-semibold">{t.common.total}</dt>
              <dd className="font-display text-2xl font-bold text-ink-950">{formatMoney(total)}</dd>
            </div>
            {monthlyPay ? (
              <div className="flex justify-between rounded-xl bg-lime-200 px-3 py-2">
                <dt className="font-semibold">{t.checkout.monthly}</dt>
                <dd className="font-bold">
                  {formatMoney(monthlyPay)} × {t.common.months(months)}
                </dd>
              </div>
            ) : null}
          </dl>
          {error ? <Alert>{error}</Alert> : null}
          <Button type="submit" size="lg" className="w-full" disabled={saving || !quote || problems.length > 0}>
            {saving ? t.common.sending : t.checkout.submit}
          </Button>
          <p className="flex items-start gap-2 text-xs text-ink-500">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {t.checkout.secure}
          </p>
        </div>
      </aside>
    </form>
  );
}
