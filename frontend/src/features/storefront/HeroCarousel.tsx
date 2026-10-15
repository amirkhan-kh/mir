"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useT } from "@/shared/i18n/client";
import type { Banner } from "@/shared/lib/types";

const THEMES: Record<Banner["theme"], { wrap: string; title: string; sub: string; cta: string; glow: string }> = {
  dark: {
    wrap: "bg-ink-950",
    title: "text-white",
    sub: "text-ink-300",
    cta: "bg-lime-400 text-ink-950 hover:bg-lime-300",
    glow: "bg-lime-400/30",
  },
  lime: {
    wrap: "brand-gradient",
    title: "text-ink-950",
    sub: "text-ink-800",
    cta: "bg-ink-950 text-white hover:bg-ink-800",
    glow: "bg-white/50",
  },
  light: {
    wrap: "bg-white ring-1 ring-ink-100",
    title: "text-ink-950",
    sub: "text-ink-600",
    cta: "bg-ink-950 text-white hover:bg-ink-800",
    glow: "bg-lime-300/50",
  },
};

export function Swoosh({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 140" className={className} aria-hidden>
      <defs>
        <linearGradient id="swoosh-g" x1="0" x2="1">
          <stop offset="0" stopColor="#d4ef6e" />
          <stop offset="0.55" stopColor="#a2d42b" />
          <stop offset="1" stopColor="#3e8a1b" />
        </linearGradient>
      </defs>
      <path d="M8 70c40 70 330 80 384-40-50 96-330 98-384 40Z" fill="url(#swoosh-g)" />
    </svg>
  );
}

function Slide({ b, active, first }: { b: Banner; active: boolean; first: boolean }) {
  const t = THEMES[b.theme];
  const body = (
    <div className={`relative flex h-full w-full overflow-hidden rounded-3xl ${t.wrap}`}>
      <div className={`pointer-events-none absolute -right-16 top-1/2 size-[420px] -translate-y-1/2 rounded-full blur-3xl ${t.glow}`} aria-hidden />
      <div className="relative z-10 flex w-full flex-col justify-between gap-4 p-6 sm:p-10 md:w-[55%] md:justify-center md:gap-6 md:pl-20">
        <div className="space-y-3 md:space-y-4">
          <h2 className={`font-display text-2xl font-bold leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-[44px] ${t.title}`}>{b.title}</h2>
          {b.subtitle ? <p className={`max-w-md text-sm leading-relaxed sm:text-base ${t.sub}`}>{b.subtitle}</p> : null}
        </div>
        {b.cta ? (
          <span className={`inline-flex h-12 w-fit items-center gap-2 rounded-2xl px-5 font-semibold transition-colors ${t.cta}`}>
            {b.cta}
            <ArrowRight className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>
      {b.image ? (
        <div className="absolute bottom-20 right-0 h-[40%] w-full md:bottom-0 md:h-full md:w-[48%]">
          <Swoosh className="absolute bottom-[6%] left-1/2 w-[92%] -translate-x-1/2 opacity-90" />
          <Image
            src={b.image}
            alt=""
            fill
            preload={first}
            sizes="(min-width: 768px) 600px, 100vw"
            className={`object-contain p-4 drop-shadow-[0_30px_40px_rgb(0_0_0/0.25)] transition-transform duration-[1.2s] ease-out md:p-10 ${active ? "scale-100" : "scale-95"}`}
          />
        </div>
      ) : null}
    </div>
  );
  return b.link ? (
    <Link href={b.link} tabIndex={active ? 0 : -1} aria-label={b.title} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(index + 1), 6000);
    return () => clearTimeout(t);
  }, [index, paused, count, go]);

  if (!count) return null;
  return (
    <section
      aria-roledescription={t.hero.carousel}
      aria-label={t.hero.label}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-3xl">
        <ul className="flex h-[440px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-[400px]" style={{ transform: `translateX(-${index * 100}%)` }}>
          {banners.map((b, i) => (
            <li key={b.id} className="h-full w-full shrink-0" aria-roledescription={t.hero.slide} aria-label={`${i + 1} / ${count}`} aria-hidden={i !== index}>
              <Slide b={b} active={i === index} first={i === 0} />
            </li>
          ))}
        </ul>
      </div>
      {count > 1 ? (
        <>
          <button type="button" aria-label={t.hero.prev} onClick={() => go(index - 1)} className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-card backdrop-blur hover:bg-white md:grid">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" aria-label={t.hero.next} onClick={() => go(index + 1)} className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-card backdrop-blur hover:bg-white md:grid">
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-4 left-6 flex gap-1.5 sm:left-10">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={t.hero.goTo(i + 1)}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-lime-400" : "w-2 bg-ink-400/60 hover:bg-ink-400"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
