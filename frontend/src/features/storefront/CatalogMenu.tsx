"use client";

import { ChevronRight, LayoutGrid, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/shared/i18n/client";
import type { Category } from "@/shared/lib/types";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";

export function CatalogMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = useT();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="catalog-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 items-center gap-2 rounded-2xl bg-ink-950 px-4 font-semibold text-white transition-colors hover:bg-ink-800"
      >
        {open ? <X className="size-5 text-lime-400" aria-hidden /> : <LayoutGrid className="size-5 text-lime-400" aria-hidden />}
        {t.nav.catalog}
      </button>
      {open ? (
        <div id="catalog-menu" className="absolute left-0 top-[calc(100%+10px)] z-50 w-[min(640px,80vw)] animate-fade-up rounded-3xl border border-ink-100 bg-white p-3 shadow-lift">
          <ul className="grid grid-cols-2 gap-1">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/katalog/${c.slug}`} className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-ink-50">
                  <span className="grid size-11 place-items-center rounded-xl bg-lime-100 text-leaf-700 transition-colors group-hover:bg-lime-400 group-hover:text-ink-950">
                    <CategoryIcon name={c.icon} className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink-900">{c.name}</span>
                    <span className="text-xs text-ink-500">{t.nav.productsCount(c.product_count)}</span>
                  </span>
                  <ChevronRight className="size-4 text-ink-300 group-hover:text-ink-700" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/katalog" className="mt-2 flex h-11 items-center justify-center rounded-2xl bg-ink-50 text-sm font-semibold text-ink-800 hover:bg-ink-100">
            {t.nav.allProducts}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
