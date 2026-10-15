"use client";

import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const go = (i: number) => setIndex((i + count) % count);

  if (!count) {
    return (
      <div className="grid aspect-square place-items-center rounded-3xl bg-white text-ink-300">
        <ImageOff className="size-16" aria-hidden />
      </div>
    );
  }
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {count > 1 ? (
        <ul className="scrollbar-none flex gap-2 overflow-x-auto md:max-h-[520px] md:flex-col md:overflow-y-auto" aria-label="Rasmlar">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                aria-label={`${i + 1}-rasm`}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className={`relative block size-16 overflow-hidden rounded-xl bg-white ring-2 transition md:size-20 ${i === index ? "ring-ink-950" : "ring-transparent hover:ring-ink-200"}`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-contain p-1.5 mix-blend-multiply" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div
        className="group relative aspect-square flex-1 overflow-hidden rounded-3xl bg-white"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(index - 1);
          if (e.key === "ArrowRight") go(index + 1);
        }}
      >
        <div className="brand-gradient absolute inset-x-[15%] bottom-[8%] h-[18%] rounded-[100%] opacity-25 blur-2xl" aria-hidden />
        <Image key={images[index]} src={images[index]} alt={name} fill preload sizes="(min-width: 1024px) 520px, 100vw" className="animate-fade-up object-contain p-8 mix-blend-multiply" />
        {count > 1 ? (
          <>
            <button type="button" aria-label="Oldingi rasm" onClick={() => go(index - 1)} className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-ink-900 shadow-card transition hover:scale-105">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" aria-label="Keyingi rasm" onClick={() => go(index + 1)} className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-ink-900 shadow-card transition hover:scale-105">
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink-950/80 px-2.5 py-1 text-xs font-semibold text-white">
              {index + 1} / {count}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
