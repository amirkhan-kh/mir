"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { api, ApiError } from "@/shared/lib/api";
import { useT } from "@/shared/i18n/client";
import { formatDate } from "@/shared/lib/format";
import type { ProductDetail } from "@/shared/lib/types";
import { Button } from "@/shared/ui/Button";
import { Field, Input, Textarea } from "@/shared/ui/Field";
import { Alert } from "@/shared/ui/States";
import { Stars } from "@/shared/ui/Stars";

function ReviewForm({ productId }: { productId: number }) {
  const t = useT();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) return <Alert tone="success">{t.reviews.thanks}</Alert>;

  return (
    <form
      className="space-y-4 rounded-2xl bg-ink-50 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setSaving(true);
        setError(null);
        try {
          await api("/public/reviews", { method: "POST", json: { product_id: productId, rating, author: f.get("author"), text: f.get("text") } });
          setDone(true);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : t.common.error);
        } finally {
          setSaving(false);
        }
      }}
    >
      <h3 className="font-display text-base font-semibold">{t.reviews.leave}</h3>
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-ink-800">{t.reviews.yourRating}</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" aria-label={t.reviews.star(i)} aria-pressed={rating === i} onMouseEnter={() => setHover(i)} onClick={() => setRating(i)} className="rounded-md p-0.5 transition-transform hover:scale-110">
              <Star className={`size-7 ${(hover || rating) >= i ? "fill-amber-400 text-amber-400" : "fill-ink-200 text-ink-200"}`} aria-hidden />
            </button>
          ))}
        </div>
      </fieldset>
      <Field label={t.reviews.name}>{(id) => <Input id={id} name="author" required minLength={2} maxLength={60} autoComplete="given-name" />}</Field>
      <Field label={t.reviews.text}>{(id) => <Textarea id={id} name="text" maxLength={1000} placeholder={t.reviews.textPlaceholder} />}</Field>
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" variant="dark" disabled={saving}>
        {saving ? t.common.sending : t.common.send}
      </Button>
    </form>
  );
}

export function Reviews({ product: p }: { product: ProductDetail }) {
  const t = useT();
  const total = Object.values(p.rating_breakdown).reduce((s, n) => s + n, 0);
  return (
    <div className="grid items-start gap-3 sm:gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-3 sm:space-y-4">
        <div className="rounded-2xl bg-white p-5">
          <p className="font-display text-5xl font-bold text-ink-950">{Number(p.rating_avg).toFixed(1)}</p>
          <div className="mt-2">
            <Stars value={Number(p.rating_avg)} size="size-5" />
          </div>
          <p className="mt-1 text-sm text-ink-500">{t.reviews.basedOn(p.rating_count)}</p>
          <ul className="mt-4 space-y-1.5">
            {[5, 4, 3, 2, 1].map((r) => {
              const n = p.rating_breakdown[r] ?? 0;
              return (
                <li key={r} className="flex items-center gap-2 text-xs text-ink-600">
                  <span className="w-3 font-semibold">{r}</span>
                  <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <span className="block h-full rounded-full bg-amber-400" style={{ width: `${total ? (n / total) * 100 : 0}%` }} />
                  </span>
                  <span className="w-5 text-right">{n}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <ReviewForm productId={p.id} />
      </div>
      <div>
        {p.reviews.length ? (
          <ul className="space-y-3">
            {p.reviews.map((r) => (
              <li key={r.id} className="rounded-2xl bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2.5 font-semibold text-ink-900">
                    <span className="grid size-9 place-items-center rounded-full bg-lime-200 text-sm font-bold text-ink-950">{r.author.slice(0, 1).toUpperCase()}</span>
                    {r.author}
                  </p>
                  <time className="text-xs text-ink-400" dateTime={r.created_at}>
                    {formatDate(r.created_at)}
                  </time>
                </div>
                <div className="mt-2">
                  <Stars value={r.rating} />
                </div>
                {r.text ? <p className="mt-2 text-sm leading-relaxed text-ink-700">{r.text}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-ink-500">{t.reviews.none}</div>
        )}
      </div>
    </div>
  );
}
