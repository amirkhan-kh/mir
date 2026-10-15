import Link from "next/link";
import { LogoMark } from "@/shared/ui/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto size-16" />
        <p className="mt-6 font-display text-6xl font-bold text-ink-950">404</p>
        <h1 className="mt-2 font-display text-xl font-semibold">Sahifa topilmadi</h1>
        <p className="mt-2 text-sm text-ink-500">Manzil noto'g'ri yoki tovar sotuvdan olingan bo'lishi mumkin.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/" className="inline-flex h-11 items-center rounded-xl bg-lime-400 px-5 font-semibold text-ink-950 hover:bg-lime-500">
            Bosh sahifa
          </Link>
          <Link href="/katalog" className="inline-flex h-11 items-center rounded-xl border border-ink-200 bg-white px-5 font-semibold hover:bg-ink-50">
            Katalog
          </Link>
        </div>
      </div>
    </main>
  );
}
