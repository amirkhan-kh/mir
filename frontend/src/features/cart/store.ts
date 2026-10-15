"use client";

import { createLocalStore } from "@/shared/lib/local-store";
import type { ProductCard } from "@/shared/lib/types";

export interface CartLine {
  id: number;
  qty: number;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
}

const EMPTY: CartLine[] = [];
const cart = createLocalStore<CartLine[]>("mir_cart", EMPTY);
const NO_FAV: number[] = [];
const favorites = createLocalStore<number[]>("mir_fav", NO_FAV);

export const MAX_QTY = 99;

export const useCart = cart.useValue;
export const useFavorites = favorites.useValue;
export const getCart = cart.get;

type Addable = Pick<ProductCard, "id" | "slug" | "name" | "price" | "images" | "stock">;

export function addToCart(p: Addable, qty = 1) {
  cart.set((lines) => {
    const limit = Math.min(MAX_QTY, Math.max(p.stock, 1));
    const existing = lines.find((l) => l.id === p.id);
    if (existing) {
      return lines.map((l) => (l.id === p.id ? { ...l, qty: Math.min(limit, l.qty + qty), price: p.price, stock: p.stock } : l));
    }
    return [...lines, { id: p.id, qty: Math.min(limit, qty), slug: p.slug, name: p.name, price: p.price, image: p.images[0] ?? null, stock: p.stock }];
  });
}

export function setQty(id: number, qty: number) {
  cart.set((lines) =>
    qty <= 0 ? lines.filter((l) => l.id !== id) : lines.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
  );
}

export const removeFromCart = (id: number) => cart.set((lines) => lines.filter((l) => l.id !== id));
export const clearCart = () => cart.set(() => []);

/** Refresh price/stock snapshots from a server quote. */
export function syncCart(fresh: { product_id: number; price?: number; stock?: number; name?: string }[]) {
  cart.set((lines) =>
    lines.map((l) => {
      const f = fresh.find((x) => x.product_id === l.id);
      return f && f.price !== undefined ? { ...l, price: f.price, stock: f.stock ?? l.stock, name: f.name ?? l.name } : l;
    }),
  );
}

export function toggleFavorite(id: number) {
  favorites.set((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids].slice(0, 100)));
}
