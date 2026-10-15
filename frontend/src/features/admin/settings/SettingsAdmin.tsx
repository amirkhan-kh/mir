"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { api, ApiError } from "@/shared/lib/api";
import type { Store } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { Button } from "@/shared/ui/Button";
import { Field, Input, Textarea } from "@/shared/ui/Field";
import { Card, PageHeader } from "@/shared/ui/Page";
import { Alert, ErrorState, Loading } from "@/shared/ui/States";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-4 font-display text-base font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

function Editor({ initial }: { initial: Store }) {
  const [s, setS] = useState<Store>(initial);
  const [regions, setRegions] = useState(initial.regions.join("\n"));
  const [state, setState] = useState<{ ok?: string; error?: string; saving?: boolean }>({});
  const set = <K extends keyof Store>(k: K, v: Store[K]) => setS((x) => ({ ...x, [k]: v }));
  const text = (k: keyof Store, label: string, hint?: string, required = false) => (
    <Field label={label} hint={hint}>
      {(id) => <Input id={id} required={required} maxLength={240} value={String(s[k] ?? "")} onChange={(e) => set(k, e.target.value as never)} />}
    </Field>
  );

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setState({ saving: true });
        try {
          const saved = await api<Store>("/settings", {
            method: "PUT",
            json: { ...s, regions: regions.split("\n").map((r) => r.trim()).filter(Boolean) },
          });
          setS(saved);
          setState({ ok: "Sozlamalar saqlandi. Saytda darhol ko'rinadi." });
        } catch (err) {
          setState({ error: err instanceof ApiError ? err.message : "Xatolik" });
        }
      }}
    >
      <PageHeader
        title="Sozlamalar"
        subtitle="Do'kon ma'lumotlari, yetkazib berish va muddatli to'lov shartlari"
        action={
          <Button type="submit" disabled={state.saving}>
            {state.saving ? "Saqlanmoqda…" : "Saqlash"}
          </Button>
        }
      />
      {state.ok ? <Alert tone="success">{state.ok}</Alert> : null}
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Section title="Do'kon">
        {text("store_name", "Nomi", undefined, true)}
        {text("tagline", "Shior")}
        {text("phone", "Asosiy telefon", "Saytning yuqori qismida va footerda", true)}
        {text("phone2", "Qo'shimcha telefon")}
        {text("address", "Manzil", "Do'kondan olib ketish uchun ham ko'rsatiladi")}
        {text("hours", "Ish vaqti")}
        {text("telegram", "Telegram havolasi")}
        {text("instagram", "Instagram havolasi")}
      </Section>

      <Section title="Yetkazib berish">
        <Field label="Yetkazish narxi, so'm">
          {(id) => <Input id={id} type="number" min={0} step={1000} required value={s.delivery_fee} onChange={(e) => set("delivery_fee", Number(e.target.value))} />}
        </Field>
        <Field label="Bepul yetkazish, so'mdan" hint="Shu summadan boshlab yetkazish bepul">
          {(id) => <Input id={id} type="number" min={0} step={10000} required value={s.free_delivery_from} onChange={(e) => set("free_delivery_from", Number(e.target.value))} />}
        </Field>
        {text("delivery_note", "Yetkazish haqida qisqa matn")}
        <Field label="Yetkazish hududlari" hint="Har bir qatorda bitta hudud" className="sm:col-span-2">
          {(id) => <Textarea id={id} className="min-h-40" value={regions} onChange={(e) => setRegions(e.target.value)} />}
        </Field>
      </Section>

      <Card className="p-5 sm:p-6">
        <h2 className="font-display text-base font-semibold">Muddatli to'lov</h2>
        <p className="mb-4 mt-0.5 text-sm text-ink-500">Har bir muddat uchun ustama foizi. 0% — ustamasiz. Ro'yxat bo'sh bo'lsa, muddatli to'lov o'chadi.</p>
        <ul className="space-y-2">
          {s.installment.map((p, i) => (
            <li key={i} className="flex items-end gap-2">
              <Field label="Muddat, oy" className="flex-1">
                {(id) => <Input id={id} type="number" min={1} max={60} required value={p.months} onChange={(e) => set("installment", s.installment.map((x, j) => (j === i ? { ...x, months: Number(e.target.value) } : x)))} />}
              </Field>
              <Field label="Ustama, %" className="flex-1">
                {(id) => <Input id={id} type="number" min={0} max={200} step={0.5} required value={p.percent} onChange={(e) => set("installment", s.installment.map((x, j) => (j === i ? { ...x, percent: Number(e.target.value) } : x)))} />}
              </Field>
              <button type="button" aria-label={`${p.months} oylik rejani o'chirish`} onClick={() => set("installment", s.installment.filter((_, j) => j !== i))} className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-400 hover:bg-flame-50 hover:text-flame-600">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <Button variant="soft" size="sm" className="mt-3" disabled={s.installment.length >= 8} onClick={() => set("installment", [...s.installment, { months: 24, percent: 36 }])}>
          <Plus className="size-4" aria-hidden /> Muddat qo'shish
        </Button>
      </Card>
    </form>
  );
}

export function SettingsAdmin() {
  const { data, error, reload } = useApi<Store>("/settings");
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading />;
  return <Editor initial={data} />;
}
