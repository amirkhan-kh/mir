import { Clock, MapPin, Phone, Send } from "lucide-react";
import Link from "next/link";
import type { Category, Store } from "@/shared/lib/types";
import { Logo } from "@/shared/ui/Logo";

export function Footer({ store, categories }: { store: Store; categories: Category[] }) {
  const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
  return (
    <footer className="relative mt-10 overflow-hidden bg-ink-950 text-ink-300">
      <div className="brand-gradient pointer-events-none absolute -bottom-40 left-1/2 h-64 w-[140%] -translate-x-1/2 rounded-[100%] opacity-20 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-[1320px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo inverted />
          <p className="max-w-xs text-sm leading-relaxed">{store.tagline}. Rasmiy kafolat, muddatli to'lov va o'z kuryerlarimiz orqali yetkazib berish.</p>
        </div>
        <div>
          <h2 className="mb-4 font-display text-sm font-semibold text-white">Katalog</h2>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/katalog/${c.slug}`} className="hover:text-lime-300">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 font-display text-sm font-semibold text-white">Xaridorlarga</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/kuzatish" className="hover:text-lime-300">Buyurtmani kuzatish</Link></li>
            <li><Link href="/savat" className="hover:text-lime-300">Savat</Link></li>
            <li><Link href="/sevimlilar" className="hover:text-lime-300">Sevimlilar</Link></li>
            <li><Link href="/katalog?discount=1" className="hover:text-lime-300">Chegirmalar</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 font-display text-sm font-semibold text-white">Aloqa</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={tel(store.phone)} className="flex items-center gap-2 font-display text-lg font-semibold text-white hover:text-lime-300">
                <Phone className="size-4 text-lime-400" aria-hidden />
                {store.phone}
              </a>
            </li>
            {store.phone2 ? (
              <li>
                <a href={tel(store.phone2)} className="hover:text-lime-300">{store.phone2}</a>
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-lime-400" aria-hidden />
              {store.address}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-lime-400" aria-hidden />
              {store.hours}
            </li>
            {store.telegram ? (
              <li>
                <a href={store.telegram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-semibold text-white hover:bg-white/15">
                  <Send className="size-4 text-lime-400" aria-hidden />
                  Telegram
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <p className="mx-auto max-w-[1320px] px-4 py-5 text-xs text-ink-400 sm:px-6">
          © {new Date().getFullYear()} {store.store_name}. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  );
}
