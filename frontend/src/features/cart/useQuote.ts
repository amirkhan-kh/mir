"use client";

import { useEffect, useState } from "react";
import { api } from "@/shared/lib/api";
import { syncCart, type CartLine } from "./store";

export interface QuoteItem {
  product_id: number;
  qty: number;
  available: boolean;
  problem: string | null;
  price?: number;
  stock?: number;
  name?: string;
  line_total?: number;
}

export interface Quote {
  items: QuoteItem[];
  subtotal: number;
  delivery_fee: number;
  free_delivery_from: number;
  installment: { months: number; percent: number; total: number; monthly: number }[];
}

/** Live server quote for the cart: real prices, stock problems, installment totals. */
export function useQuote(lines: CartLine[]) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = lines.map((l) => `${l.id}:${l.qty}`).join(",");

  useEffect(() => {
    if (!key) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      api<Quote>("/public/orders/quote", {
        method: "POST",
        json: { items: key.split(",").map((s) => ({ product_id: Number(s.split(":")[0]), qty: Number(s.split(":")[1]) })) },
      })
        .then((q) => {
          if (cancelled) return;
          setQuote(q);
          setError(null);
          syncCart(q.items);
        })
        .catch((e: Error) => !cancelled && setError(e.message));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [key]);

  const problems = quote?.items.filter((i) => i.problem) ?? [];
  return { quote, error, problems };
}
