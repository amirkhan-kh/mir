import { Clock, MapPin, Phone, Search, Truck } from "lucide-react";
import Link from "next/link";
import type { Category, Store } from "@/shared/lib/types";
import { Logo } from "@/shared/ui/Logo";
import { CatalogMenu } from "./CatalogMenu";
import { HeaderActions } from "./HeaderActions";

export function Header({ store, categories }: { store: Store; categories: Category[] }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 shadow-[0_1px_0_var(--color-ink-100)] backdrop-blur-xl">
      <div className="hidden bg-ink-950 text-[13px] text-ink-300 md:block">
        <div className="mx-auto flex h-9 max-w-[1320px] items-center justify-between gap-6 px-6">
          <p className="flex items-center gap-2">
            <Truck className="size-4 text-lime-400" aria-hidden />
            {store.delivery_note}
          </p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden />
              {store.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              {store.hours}
            </span>
            <a href={`tel:${store.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1.5 font-semibold text-white hover:text-lime-300">
              <Phone className="size-3.5" aria-hidden />
              {store.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-3 sm:px-6 lg:gap-5">
        <Logo />
        <CatalogMenu categories={categories} />
        <form action="/katalog" role="search" className="relative hidden flex-1 md:block">
          <label htmlFor="site-search" className="sr-only">
            Tovarlarni qidirish
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Tovar, brend yoki model nomi…"
            className="h-12 w-full rounded-2xl border-2 border-ink-950 bg-white pl-4 pr-14 text-[15px] placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-lime-300/50"
          />
          <button type="submit" aria-label="Qidirish" className="absolute right-1.5 top-1.5 grid h-9 w-11 place-items-center rounded-xl bg-lime-400 text-ink-950 transition-colors hover:bg-lime-500">
            <Search className="size-5" />
          </button>
        </form>
        <HeaderActions />
      </div>

      <form action="/katalog" role="search" className="px-4 pb-3 md:hidden">
        <label htmlFor="site-search-m" className="sr-only">
          Tovarlarni qidirish
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            id="site-search-m"
            name="q"
            type="search"
            placeholder="Tovarlarni qidirish"
            className="h-11 w-full rounded-xl bg-ink-100 pl-10 pr-3 text-[15px] placeholder:text-ink-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-600"
          />
        </div>
      </form>

      <nav aria-label="Kategoriyalar" className="hidden border-t border-ink-100 lg:block">
        <ul className="scrollbar-none mx-auto flex max-w-[1320px] gap-1 overflow-x-auto px-6 py-1.5 text-sm">
          <li>
            <Link href="/katalog?discount=1" className="flex h-9 items-center rounded-lg px-3 font-semibold text-flame-600 hover:bg-flame-50">
              Chegirmalar
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/katalog/${c.slug}`} className="flex h-9 items-center whitespace-nowrap rounded-lg px-3 font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-950">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
