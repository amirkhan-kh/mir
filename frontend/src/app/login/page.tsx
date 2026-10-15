import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/LoginForm";
import { Logo } from "@/shared/ui/Logo";

export const metadata: Metadata = {
  title: "Xodimlar uchun kirish",
  description: "Mir boshqaruv paneliga kirish.",
  robots: { index: false },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink-950 px-4">
      <div className="brand-gradient pointer-events-none absolute -bottom-48 left-1/2 h-96 w-[160%] -translate-x-1/2 rounded-[100%] opacity-30 blur-3xl" aria-hidden />
      <div className="relative w-full max-w-sm animate-fade-up rounded-3xl bg-white p-7 shadow-lift">
        <Logo />
        <h1 className="mt-6 font-display text-xl font-semibold">Boshqaruv paneli</h1>
        <p className="mb-6 mt-1 text-sm text-ink-500">Xodim login va parolingiz bilan kiring.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <Link href="/" className="mt-5 block text-center text-sm font-semibold text-ink-500 hover:text-ink-950">
          ← Do'konga qaytish
        </Link>
      </div>
    </main>
  );
}
