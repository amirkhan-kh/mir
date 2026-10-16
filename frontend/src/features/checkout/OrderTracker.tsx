"use client";

import { Check, CircleX, ImageOff, PartyPopper, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/shared/lib/api";
import { formatDate, formatMoney, formatPhone } from "@/shared/lib/format";
import { useT } from "@/shared/i18n/client";
import type { Order, Store } from "@/shared/lib/types";
import { Button } from "@/shared/ui/Button";
import { Field, Input } from "@/shared/ui/Field";
import { Alert, Loading } from "@/shared/ui/States";

const KEY = "mir_last_order";
const STEPS = ["new", "confirmed", "delivering", "delivered"] as const;

export function TrackForm({ initialNumber = "" }: { initialNumber?: string }) {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const number = String(f.get("number")).trim().toUpperCase();
        const phone = String(f.get("phone")).replace(/\D/g, "");
        setSaving(true);
        setError(null);
        try {
          await api(`/public/orders/${encodeURIComponent(number)}?phone=${phone}`);
          sessionStorage.setItem(KEY, JSON.stringify({ number, phone }));
          router.push(`/buyurtma/${number}`);
          router.refresh();
        } catch (err) {
          setError(err instanceof ApiError ? err.message : t.common.error);
        } finally {
          setSaving(false);
        }
      }}
    >
      <Field label={t.track.number}>{(id) => <Input id={id} name="number" required defaultValue={initialNumber} placeholder="MIR-1001" pattern="[A-Za-z]{3}-?\d+" maxLength={20} />}</Field>
      <Field label={t.track.phone} hint={t.track.phoneHint}>
        {(id) => <Input id={id} name="phone" type="tel" inputMode="tel" required placeholder="+998 90 123 45 67" minLength={9} maxLength={20} />}
      </Field>
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" variant="dark" size="lg" className="w-full" disabled={saving}>
        {saving ? t.track.searching : t.track.submit}
      </Button>
    </form>
  );
}

export function OrderTracker({ number, store }: { number: string; store: Store }) {
  const t = useT();
  const [order, setOrder] = useState<Order | null>(null);
  const [fresh, setFresh] = useState(false);
  const [state, setState] = useState<"loading" | "form" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let saved: { number: string; phone: string; fresh?: boolean } | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    } catch {
      saved = null;
    }
    if (!saved || saved.number.toUpperCase() !== number.toUpperCase()) {
      setState("form");
      return;
    }
    // Functional update: the effect runs twice in dev (StrictMode) and the second read already sees fresh=false.
    if (saved.fresh) setFresh(true);
    if (saved.fresh) sessionStorage.setItem(KEY, JSON.stringify({ ...saved, fresh: false }));
    api<Order>(`/public/orders/${encodeURIComponent(number)}?phone=${encodeURIComponent(saved.phone)}`)
      .then((o) => {
        setOrder(o);
        setState("ready");
      })
      .catch((e: Error) => {
        setError(e.message);
        setState("error");
      });
  }, [number]);

  if (state === "loading") return <Loading />;
  if (state === "form" || state === "error") {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6">
        <h1 className="mb-1 font-display text-xl font-semibold">{t.track.order(number)}</h1>
        <p className="mb-5 text-sm text-ink-500">{t.track.enterPhone}</p>
        {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
        <TrackForm initialNumber={number} />
      </div>
    );
  }
  if (!order) return null;

  const cancelled = order.status === "cancelled";
  const current = cancelled ? -1 : STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const at = (s: string) => order.events.find((e) => e.status === s)?.created_at;
  const tel = store.phone.replace(/[^\d+]/g, "");

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {fresh ? (
        <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-white sm:p-8">
          <div className="brand-gradient absolute -right-16 -top-16 size-56 rounded-full opacity-40 blur-3xl" aria-hidden />
          <PartyPopper className="relative size-10 text-lime-400" aria-hidden />
          <h1 className="relative mt-4 font-display text-2xl font-bold sm:text-3xl">{t.track.thanks}</h1>
          <p className="relative mt-2 max-w-xl text-ink-300">
            {t.track.numberLabel} <b className="text-lime-300">{order.number}</b>. {t.track.callText(formatPhone(order.phone))}
          </p>
        </div>
      ) : (
        <h1 className="font-display text-2xl font-semibold">{t.track.order(order.number)}</h1>
      )}

      <section aria-label={t.track.status} className="rounded-3xl bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-ink-500">{formatDate(order.created_at, true)}</p>
          <span className="rounded-full bg-ink-100 px-3 py-1 text-sm font-semibold">{t.status.order[order.status]}</span>
        </div>
        {cancelled ? (
          <div className="flex items-center gap-3 rounded-2xl bg-flame-50 p-4 text-flame-600">
            <CircleX className="size-6 shrink-0" aria-hidden />
            <p className="text-sm font-semibold">{t.track.cancelled(store.phone)}</p>
          </div>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-4 sm:gap-2">
            {STEPS.map((s, i) => {
              const done = i <= current;
              return (
                <li key={s} className="relative flex gap-3 sm:flex-col sm:gap-2">
                  {i < STEPS.length - 1 ? <span className={`absolute left-4 top-9 h-[calc(100%-1rem)] w-0.5 sm:left-9 sm:top-4 sm:h-0.5 sm:w-[calc(100%-2.5rem)] ${i < current ? "bg-leaf-600" : "bg-ink-200"}`} aria-hidden /> : null}
                  <span className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full ${done ? "bg-leaf-600 text-white" : "bg-ink-100 text-ink-400"} ${i === current ? "ring-4 ring-lime-300" : ""}`}>
                    {done ? <Check className="size-4" aria-hidden /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </span>
                  <span>
                    <span className={`block text-sm font-semibold ${done ? "text-ink-950" : "text-ink-400"}`}>{t.status.step[s].title}</span>
                    <span className="block text-xs text-ink-500">{at(s) ? formatDate(at(s)!, true) : t.status.step[s].hint}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <section aria-label={t.common.goods} className="rounded-3xl bg-white p-5 sm:p-6">
          <ul className="divide-y divide-ink-100">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex items-center gap-3 py-3">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                  {i.image ? <Image src={i.image} alt="" fill sizes="64px" className="object-contain p-1.5 mix-blend-multiply" /> : <ImageOff className="m-auto mt-5 size-5 text-ink-300" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  {i.slug ? (
                    <Link href={`/mahsulot/${i.slug}`} className="line-clamp-2 font-medium hover:text-leaf-700">
                      {i.name}
                    </Link>
                  ) : (
                    <span className="line-clamp-2 font-medium">{i.name}</span>
                  )}
                  <span className="text-ink-500">
                    {i.qty} × {formatMoney(i.price)}
                  </span>
                </span>
                <span className="font-semibold">{formatMoney(i.line_total)}</span>
              </li>
            ))}
          </ul>
        </section>
        <aside className="space-y-4">
          <dl className="space-y-2.5 rounded-3xl bg-white p-5 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-ink-500">{t.track.receive}</dt><dd className="text-right font-medium">{t.status.delivery[order.delivery_method]}</dd></div>
            {order.delivery_method === "courier" ? <div className="flex justify-between gap-3"><dt className="text-ink-500">{t.track.address}</dt><dd className="text-right font-medium">{order.region}, {order.address}</dd></div> : null}
            <div className="flex justify-between gap-3"><dt className="text-ink-500">{t.track.payment}</dt><dd className="text-right font-medium">{t.status.payment[order.payment_method]}{order.installment_months ? `, ${t.common.months(order.installment_months)}` : ""}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-500">{t.common.delivery}</dt><dd className="font-medium">{order.delivery_fee ? formatMoney(order.delivery_fee) : t.common.free}</dd></div>
            <div className="flex items-baseline justify-between border-t border-ink-100 pt-3"><dt className="font-semibold">{t.common.total}</dt><dd className="font-display text-xl font-bold">{formatMoney(order.total)}</dd></div>
            {order.installment_monthly ? <div className="flex justify-between rounded-xl bg-lime-200 px-3 py-2"><dt className="font-semibold">{t.track.perMonth}</dt><dd className="font-bold">{formatMoney(order.installment_monthly)}</dd></div> : null}
          </dl>
          <a href={`tel:${tel}`} className="flex items-center gap-3 rounded-3xl bg-ink-950 p-5 text-white hover:bg-ink-800">
            <Phone className="size-5 text-lime-400" aria-hidden />
            <span>
              <span className="block text-xs text-ink-300">{t.track.questions}</span>
              <span className="font-display font-semibold">{store.phone}</span>
            </span>
          </a>
        </aside>
      </div>
    </div>
  );
}
