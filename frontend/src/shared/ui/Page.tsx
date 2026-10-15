"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-950">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-ink-100 bg-white shadow-card ${className}`}>{children}</section>;
}

export function KpiCard({ label, value, hint, icon, accent = false }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; accent?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${accent ? "bg-ink-950 text-white" : "border border-ink-100 bg-white shadow-card"}`}>
      {accent ? <div className="brand-gradient absolute -right-10 -top-10 size-32 rounded-full opacity-30 blur-2xl" aria-hidden /> : null}
      <div className="relative flex items-start justify-between gap-3">
        <p className={`text-sm font-medium ${accent ? "text-ink-300" : "text-ink-500"}`}>{label}</p>
        {icon ? <span className={`grid size-9 place-items-center rounded-xl ${accent ? "bg-lime-400 text-ink-950" : "bg-lime-100 text-leaf-700"}`}>{icon}</span> : null}
      </div>
      <p className="relative mt-3 font-display text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className={`relative mt-1 text-xs ${accent ? "text-ink-300" : "text-ink-500"}`}>{hint}</p> : null}
    </div>
  );
}

export function SearchInput({ value, onChange, label = "Qidirish" }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="h-10 w-full rounded-xl border border-ink-200 bg-white pl-9 pr-3 text-sm focus:border-leaf-600 focus:outline-none focus:ring-4 focus:ring-lime-300/40"
      />
    </label>
  );
}

export function Chips({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; count?: number }[];
}) {
  return (
    <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Filtr">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors ${
              active ? "bg-ink-950 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:ring-ink-300"
            }`}
          >
            {o.label}
            {o.count !== undefined ? (
              <span className={`rounded-full px-1.5 text-xs ${active ? "bg-lime-400 text-ink-950" : "bg-ink-100 text-ink-600"}`}>{o.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function Pagination({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-4 py-3 text-sm text-ink-600">
      <span>
        Jami: <b className="text-ink-900">{total}</b>
      </span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Oldingi sahifa" disabled={page <= 1} onClick={() => onPage(page - 1)} className="grid size-9 place-items-center rounded-xl ring-1 ring-ink-200 hover:bg-ink-50 disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <span className="tabular-nums">
          {page} / {pages}
        </span>
        <button type="button" aria-label="Keyingi sahifa" disabled={page >= pages} onClick={() => onPage(page + 1)} className="grid size-9 place-items-center rounded-xl ring-1 ring-ink-200 hover:bg-ink-50 disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            {head.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">{children}</tbody>
      </table>
    </div>
  );
}
