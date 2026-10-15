"use client";

import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useT } from "@/shared/i18n/client";
import type { ProductCard } from "@/shared/lib/types";
import { addToCart, setQty, toggleFavorite, useCart, useFavorites } from "./store";

type Addable = Pick<ProductCard, "id" | "slug" | "name" | "price" | "images" | "stock">;

export function FavoriteButton({ id, name, className = "" }: { id: number; name: string; className?: string }) {
  const t = useT();
  const fav = useFavorites().includes(id);
  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? t.card.favRemove(name) : t.card.favAdd(name)}
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite(id);
      }}
      className={`grid size-9 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-ink-100 backdrop-blur transition-transform hover:scale-110 active:scale-95 ${className}`}
    >
      <Heart className={`size-4.5 transition-colors ${fav ? "fill-flame-500 text-flame-500" : "text-ink-600"}`} aria-hidden />
    </button>
  );
}

export function QtyStepper({ id, qty, max, name, size = "md" }: { id: number; qty: number; max: number; name: string; size?: "sm" | "md" }) {
  const t = useT();
  const h = size === "sm" ? "h-10" : "h-12";
  return (
    <div className={`flex ${h} items-center justify-between rounded-xl bg-ink-100 p-1`}>
      <button type="button" aria-label={t.card.dec(name)} onClick={() => setQty(id, qty - 1)} className="grid h-full aspect-square place-items-center rounded-lg text-ink-800 hover:bg-white">
        <Minus className="size-4" />
      </button>
      <span className="min-w-8 text-center font-semibold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button type="button" aria-label={t.card.inc(name)} disabled={qty >= max} onClick={() => setQty(id, qty + 1)} className="grid h-full aspect-square place-items-center rounded-lg text-ink-800 hover:bg-white disabled:opacity-30">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/** Card-level CTA: "add to cart" → becomes a stepper once in cart. */
export function AddToCartButton({ product }: { product: Addable }) {
  const t = useT();
  const line = useCart().find((l) => l.id === product.id);
  if (product.stock <= 0) {
    return (
      <span className="flex h-10 items-center justify-center rounded-xl bg-ink-100 text-sm font-semibold text-ink-500">
        {t.card.outOfStock}
      </span>
    );
  }
  if (line) return <QtyStepper id={product.id} qty={line.qty} max={Math.min(product.stock, 99)} name={product.name} size="sm" />;
  return (
    <button
      type="button"
      onClick={() => addToCart(product)}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-lime-400 text-sm font-semibold text-ink-950 transition-colors hover:bg-lime-500 active:scale-[0.98]"
    >
      <ShoppingBag className="size-4" aria-hidden />
      {t.card.addToCart}
    </button>
  );
}

/** Product page CTA pair. */
export function BuyButtons({ product }: { product: Addable }) {
  const t = useT();
  const line = useCart().find((l) => l.id === product.id);
  if (product.stock <= 0) {
    return (
      <div className="rounded-2xl bg-ink-100 p-4 text-center text-sm font-semibold text-ink-600">
        {t.card.soon}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {line ? (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <QtyStepper id={product.id} qty={line.qty} max={Math.min(product.stock, 99)} name={product.name} />
          <Link href="/savat" className="flex h-12 items-center gap-2 rounded-xl bg-ink-950 px-4 text-sm font-semibold text-white hover:bg-ink-800">
            <Check className="size-4 text-lime-400" aria-hidden />
            {t.card.inCart}
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => addToCart(product)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-400 text-base font-semibold text-ink-950 transition-colors hover:bg-lime-500 active:scale-[0.99]"
        >
          <ShoppingBag className="size-5" aria-hidden />
          {t.card.addToCartLong}
        </button>
      )}
      <Link
        href="/rasmiylashtirish"
        onClick={() => {
          if (!line) addToCart(product);
        }}
        className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-ink-950 text-base font-semibold text-ink-950 transition-colors hover:bg-ink-950 hover:text-white"
      >
        {t.card.buyNow}
      </Link>
    </div>
  );
}
