"use client";

import { Heart, Home, LayoutGrid, PackageSearch, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart, useFavorites } from "@/features/cart/store";

export function MobileTabBar() {
  const pathname = usePathname();
  const cart = useCart().reduce((s, l) => s + l.qty, 0);
  const fav = useFavorites().length;
  if (pathname.startsWith("/mahsulot/")) return null;

  const tabs = [
    { href: "/", label: "Asosiy", icon: Home, active: pathname === "/" },
    { href: "/katalog", label: "Katalog", icon: LayoutGrid, active: pathname.startsWith("/katalog") },
    { href: "/savat", label: "Savat", icon: ShoppingBag, active: pathname.startsWith("/savat") || pathname.startsWith("/rasmiylashtirish"), count: cart },
    { href: "/sevimlilar", label: "Sevimlilar", icon: Heart, active: pathname.startsWith("/sevimlilar"), count: fav },
    { href: "/kuzatish", label: "Buyurtmam", icon: PackageSearch, active: pathname.startsWith("/kuzatish") || pathname.startsWith("/buyurtma") },
  ];

  return (
    <nav aria-label="Asosiy menyu" className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 py-2 text-[11px] font-semibold ${t.active ? "text-ink-950" : "text-ink-500"}`}
            >
              <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${t.active ? "bg-lime-300" : ""}`}>
                <t.icon className="size-5" aria-hidden />
              </span>
              {t.label}
              {t.count ? (
                <span className="absolute left-1/2 top-1 ml-2 grid min-w-4.5 place-items-center rounded-full bg-ink-950 px-1 text-[10px] font-bold text-lime-300">
                  {t.count}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
