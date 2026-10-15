"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useT } from "@/shared/i18n/client";
import { formatNumber } from "@/shared/lib/format";

const SORTS = ["popular", "new", "cheap", "expensive", "rating", "discount"] as const;

function useUpdate() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
    next.delete("page");
    start(() => router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  return { params, update, pending };
}

export function SortSelect() {
  const { params, update } = useUpdate();
  const t = useT();
  return (
    <label className="flex items-center gap-2 text-sm text-ink-600">
      <span className="hidden sm:inline">{t.catalog.sortLabel}</span>
      <select
        aria-label={t.catalog.sortLabel}
        value={params.get("sort") ?? "popular"}
        onChange={(e) => update({ sort: e.target.value === "popular" ? null : e.target.value })}
        className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-900 focus:border-leaf-600 focus:outline-none"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {t.catalog.sort[s]}
          </option>
        ))}
      </select>
    </label>
  );
}

interface Facets {
  brands: { name: string; count: number }[];
  price: { min: number; max: number };
}

function FilterBody({ facets, onDone }: { facets: Facets; onDone?: () => void }) {
  const { params, update, pending } = useUpdate();
  const t = useT();
  const brands = (params.get("brand") ?? "").split(",").filter(Boolean);
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  useEffect(() => {
    setMin(params.get("min") ?? "");
    setMax(params.get("max") ?? "");
  }, [params]);

  const toggleBrand = (b: string) => {
    const next = brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b];
    update({ brand: next.join(",") || null });
  };
  const flag = (key: string, label: string) => (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm font-medium text-ink-800">
      {label}
      <input
        type="checkbox"
        role="switch"
        checked={params.get(key) === "1"}
        onChange={(e) => update({ [key]: e.target.checked ? "1" : null })}
        className="peer sr-only"
      />
      <span className="relative h-6 w-10 rounded-full bg-ink-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-leaf-600 peer-checked:after:translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-leaf-600" aria-hidden />
    </label>
  );
  const active = ["brand", "min", "max", "in_stock", "discount", "featured"].some((k) => params.get(k));

  return (
    <div className={`space-y-6 ${pending ? "opacity-60" : ""}`}>
      <div className="space-y-1">
        {flag("in_stock", t.catalog.inStock)}
        {flag("discount", t.catalog.withDiscount)}
      </div>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          update({ min: min || null, max: max || null });
          onDone?.();
        }}
      >
        <h3 className="text-sm font-semibold text-ink-950">{t.catalog.price}</h3>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" inputMode="numeric" min={0} aria-label={t.catalog.min} placeholder={t.catalog.from(formatNumber(facets.price.min))} value={min} onChange={(e) => setMin(e.target.value)} className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm focus:border-leaf-600 focus:outline-none" />
          <input type="number" inputMode="numeric" min={0} aria-label={t.catalog.max} placeholder={t.catalog.to(formatNumber(facets.price.max))} value={max} onChange={(e) => setMax(e.target.value)} className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm focus:border-leaf-600 focus:outline-none" />
        </div>
        <button type="submit" className="h-10 w-full rounded-xl bg-ink-950 text-sm font-semibold text-white hover:bg-ink-800">
          {t.catalog.applyPrice}
        </button>
      </form>
      {facets.brands.length ? (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold text-ink-950">{t.catalog.brand}</legend>
          {facets.brands.map((b) => (
            <label key={b.name} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-800">
              <input type="checkbox" checked={brands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="size-4.5 rounded accent-leaf-600" />
              <span className="flex-1">{b.name}</span>
              <span className="text-xs text-ink-400">{b.count}</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      {active ? (
        <button
          type="button"
          onClick={() => {
            update({ brand: null, min: null, max: null, in_stock: null, discount: null, featured: null });
            onDone?.();
          }}
          className="text-sm font-semibold text-flame-600 hover:underline"
        >
          {t.catalog.clear}
        </button>
      ) : null}
    </div>
  );
}

export function CatalogFilters({ facets }: { facets: Facets }) {
  const t = useT();
  return (
    <aside aria-label={t.catalog.filters} className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-6 rounded-2xl bg-white p-5">
        <FilterBody facets={facets} />
      </div>
    </aside>
  );
}

export function MobileFilters({ facets }: { facets: Facets }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-sm font-semibold text-ink-900 ring-1 ring-ink-200 lg:hidden">
        <SlidersHorizontal className="size-4" aria-hidden />
        {t.catalog.filters}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.catalog.filters}>
          <button type="button" aria-label={t.common.close} className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-fade-up overflow-y-auto rounded-t-3xl bg-white p-5 pb-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{t.catalog.filters}</h2>
              <button type="button" aria-label={t.catalog.closeFilters} onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-xl hover:bg-ink-100">
                <X className="size-5" />
              </button>
            </div>
            <FilterBody facets={facets} onDone={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
