import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/LoginForm";
import { getT } from "@/shared/i18n/server";
import { LangSwitch } from "@/shared/ui/LangSwitch";
import { Logo } from "@/shared/ui/Logo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t.meta.login,
    description: t.meta.loginDescription,
    robots: { index: false },
    alternates: { canonical: "/login" },
  };
}

export default async function LoginPage() {
  const t = await getT();
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink-950 px-4">
      <div className="brand-gradient pointer-events-none absolute -bottom-48 left-1/2 h-96 w-[160%] -translate-x-1/2 rounded-[100%] opacity-30 blur-3xl" aria-hidden />
      <div className="relative w-full max-w-sm animate-fade-up rounded-3xl bg-white p-7 shadow-lift">
        <div className="flex items-start justify-between gap-3">
          <Logo />
          <LangSwitch />
        </div>
        <h1 className="mt-6 font-display text-xl font-semibold">{t.login.title}</h1>
        <p className="mb-6 mt-1 text-sm text-ink-500">{t.login.hint}</p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <Link href="/" className="mt-5 block text-center text-sm font-semibold text-ink-500 hover:text-ink-950">
          {t.login.back}
        </Link>
      </div>
    </main>
  );
}
