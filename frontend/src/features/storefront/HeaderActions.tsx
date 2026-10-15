"use client";

import { Heart, PackageSearch, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart, useFavorites } from "@/features/cart/store";

function Action({ href, label, count, children }: { href: string; label: string; count?: number; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={count ? `${label}: ${count}` : label}
      className="relative flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-950"
    >
      {children}
      <span className="hidden text-[11px] font-semibold lg:block">{label}</span>
      {count ? (
        <span className="absolute right-0.5 top-0 grid min-w-5 place-items-center rounded-full bg-lime-400 px-1 text-[11px] font-bold text-ink-950 ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

export function HeaderActions() {
  const cart = useCart();
  const fav = useFavorites();
  const count = cart.reduce((s, l) => s + l.qty, 0);
  return (
    <nav aria-label="Foydalanuvchi" className="ml-auto flex items-center gap-0.5 md:ml-0">
      <span className="hidden sm:contents">
        <Action href="/kuzatish" label="Buyurtmam">
          <PackageSearch className="size-5.5" aria-hidden />
        </Action>
      </span>
      <Action href="/sevimlilar" label="Sevimlilar" count={fav.length}>
        <Heart className="size-5.5" aria-hidden />
      </Action>
      <Action href="/savat" label="Savat" count={count}>
        <ShoppingBag className="size-5.5" aria-hidden />
      </Action>
    </nav>
  );
}
