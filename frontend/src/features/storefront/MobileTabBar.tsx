"use client";

import { Heart, Home, LayoutGrid, PackageSearch, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart, useFavorites } from "@/features/cart/store";
import { useT } from "@/shared/i18n/client";

export function MobileTabBar() {
  const pathname = usePathname();
  const t = useT();
  const cart = useCart().reduce((s, l) => s + l.qty, 0);
  const fav = useFavorites().length;
  if (pathname.startsWith("/mahsulot/")) return null;

  const tabs = [
    { href: "/", label: t.nav.home, icon: Home, active: pathname === "/" },
    { href: "/katalog", label: t.nav.catalog, icon: LayoutGrid, active: pathname.startsWith("/katalog") },
    { href: "/savat", label: t.nav.cart, icon: ShoppingBag, active: pathname.startsWith("/savat") || pathname.startsWith("/rasmiylashtirish"), count: cart },
    { href: "/sevimlilar", label: t.nav.favorites, icon: Heart, active: pathname.startsWith("/sevimlilar"), count: fav },
    { href: "/kuzatish", label: t.nav.myOrder, icon: PackageSearch, active: pathname.startsWith("/kuzatish") || pathname.startsWith("/buyurtma") },
  ];

  return (
    <nav aria-label={t.nav.mainMenu} className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 py-2 text-[11px] font-semibold ${tab.active ? "text-ink-950" : "text-ink-500"}`}
            >
              <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${tab.active ? "bg-lime-300" : ""}`}>
                <tab.icon className="size-5" aria-hidden />
              </span>
              {tab.label}
              {tab.count ? (
                <span className="absolute left-1/2 top-1 ml-2 grid min-w-4.5 place-items-center rounded-full bg-ink-950 px-1 text-[10px] font-bold text-lime-300">
                  {tab.count}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
