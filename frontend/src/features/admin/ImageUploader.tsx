"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { ApiError, uploadImage } from "@/shared/lib/api";
import { Alert } from "@/shared/ui/States";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

/** Multi-image uploader; first image is the main one on the storefront. */
export function ImageUploader({ value, onChange, max = 10, label = "Rasmlar" }: { value: string[]; onChange: (v: string[]) => void; max?: number; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const add = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, max - value.length);
    if (!list.length) return;
    setError(null);
    setBusy(list.length);
    const urls: string[] = [];
    for (const f of list) {
      try {
        urls.push(await uploadImage(f));
      } catch (err) {
        setError(err instanceof ApiError ? `${f.name}: ${err.message}` : "Yuklashda xato");
      }
      setBusy((n) => n - 1);
    }
    onChange([...value, ...urls]);
  };

  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-ink-800">
        {label} <span className="font-normal text-ink-500">· birinchisi asosiy rasm · {value.length}/{max}</span>
      </p>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {value.map((src, i) => (
          <li key={src} className={`group relative aspect-square overflow-hidden rounded-2xl bg-ink-50 ring-2 ${i === 0 ? "ring-lime-400" : "ring-transparent"}`}>
            <Image src={src} alt={`${i + 1}-rasm`} fill sizes="160px" className="object-contain p-2" />
            {i === 0 ? <span className="absolute left-1.5 top-1.5 rounded-md bg-ink-950 px-1.5 py-0.5 text-[10px] font-bold text-lime-300">Asosiy</span> : null}
            <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
              <button type="button" aria-label={`${i + 1}-rasmni chapga surish`} disabled={i === 0} onClick={() => move(i, -1)} className="grid size-7 place-items-center rounded-lg bg-white/95 shadow disabled:opacity-30">
                <ArrowLeft className="size-3.5" />
              </button>
              <button type="button" aria-label={`${i + 1}-rasmni o'chirish`} onClick={() => onChange(value.filter((_, x) => x !== i))} className="grid size-7 place-items-center rounded-lg bg-white/95 text-flame-600 shadow">
                <Trash2 className="size-3.5" />
              </button>
              <button type="button" aria-label={`${i + 1}-rasmni o'ngga surish`} disabled={i === value.length - 1} onClick={() => move(i, 1)} className="grid size-7 place-items-center rounded-lg bg-white/95 shadow disabled:opacity-30">
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </li>
        ))}
        {value.length < max ? (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                add(e.dataTransfer.files);
              }}
              className={`flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-xs font-semibold transition-colors ${drag ? "border-leaf-600 bg-lime-100 text-leaf-700" : "border-ink-200 text-ink-500 hover:border-ink-400 hover:text-ink-800"}`}
            >
              {busy ? <Loader2 className="size-6 animate-spin" aria-hidden /> : <ImagePlus className="size-6" aria-hidden />}
              {busy ? `Yuklanmoqda (${busy})` : "Rasm qo'shish"}
            </button>
          </li>
        ) : null}
      </ul>
      <input ref={input} type="file" accept={ACCEPT} multiple hidden aria-label="Rasm fayllari" onChange={(e) => e.target.files && add(e.target.files).then(() => (e.target.value = ""))} />
      <p className="text-xs text-ink-500">JPG, PNG, WEBP yoki AVIF, 6 MB gacha. Oq yoki shaffof fonli rasmlar eng chiroyli ko'rinadi. Sudrab tashlash ham mumkin.</p>
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}
