"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useT } from "@/shared/i18n/client";
import { api, ApiError } from "@/shared/lib/api";
import type { StoreSettings as Store } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { Button } from "@/shared/ui/Button";
import { Field, Input, Textarea } from "@/shared/ui/Field";
import { Card, PageHeader } from "@/shared/ui/Page";
import { Alert, ErrorState, Loading } from "@/shared/ui/States";

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className={`font-display text-base font-semibold ${hint ? "" : "mb-4"}`}>{title}</h2>
      {hint ? <p className="mb-4 mt-0.5 text-sm text-ink-500">{hint}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

function Editor({ initial }: { initial: Store }) {
  const t = useT();
  const tr = t.admin.settings;
  const [s, setS] = useState<Store>(initial);
  const [regions, setRegions] = useState(initial.regions.join("\n"));
  const [state, setState] = useState<{ ok?: string; error?: string; saving?: boolean }>({});
  const set = <K extends keyof Store>(k: K, v: Store[K]) => setS((x) => ({ ...x, [k]: v }));
  const text = (k: keyof Store, label: string, hint?: string, required = false, lang?: string) => (
    <Field label={label} hint={hint}>
      {(id) => <Input id={id} lang={lang} required={required} maxLength={240} value={String(s[k] ?? "")} onChange={(e) => set(k, e.target.value as never)} />}
    </Field>
  );
  const ky = (label: string) => `${label} (${t.admin.ky})`;

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
          setState({ ok: tr.saved });
        } catch (err) {
          setState({ error: err instanceof ApiError ? err.message : t.common.error });
        }
      }}
    >
      <PageHeader
        title={tr.title}
        subtitle={tr.subtitle}
        action={
          <Button type="submit" disabled={state.saving}>
            {state.saving ? t.common.saving : t.common.save}
          </Button>
        }
      />
      {state.ok ? <Alert tone="success">{state.ok}</Alert> : null}
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Section title={tr.store}>
        {text("store_name", tr.name, undefined, true)}
        {text("tagline", tr.tagline)}
        {text("phone", tr.phone, tr.phoneHint, true)}
        {text("phone2", tr.phone2)}
        {text("address", tr.address, tr.addressHint)}
        {text("hours", tr.hours)}
        {text("telegram", tr.telegram)}
        {text("instagram", tr.instagram)}
      </Section>

      <Section title={tr.delivery}>
        <Field label={tr.fee}>
          {(id) => <Input id={id} type="number" min={0} step={1000} required value={s.delivery_fee} onChange={(e) => set("delivery_fee", Number(e.target.value))} />}
        </Field>
        <Field label={tr.freeFrom} hint={tr.freeFromHint}>
          {(id) => <Input id={id} type="number" min={0} step={10000} required value={s.free_delivery_from} onChange={(e) => set("free_delivery_from", Number(e.target.value))} />}
        </Field>
        {text("delivery_note", tr.note)}
        <Field label={tr.regions} hint={tr.regionsHint} className="sm:col-span-2">
          {(id) => <Textarea id={id} className="min-h-40" value={regions} onChange={(e) => setRegions(e.target.value)} />}
        </Field>
      </Section>

      <Section title={tr.kyTitle} hint={tr.kyHint}>
        {text("tagline_ky", ky(tr.tagline), undefined, false, "ky")}
        {text("address_ky", ky(tr.address), undefined, false, "ky")}
        {text("hours_ky", ky(tr.hours), undefined, false, "ky")}
        {text("delivery_note_ky", ky(tr.note), undefined, false, "ky")}
      </Section>

      <Card className="p-5 sm:p-6">
        <h2 className="font-display text-base font-semibold">{tr.installment}</h2>
        <p className="mb-4 mt-0.5 text-sm text-ink-500">{tr.installmentHint}</p>
        <ul className="space-y-2">
          {s.installment.map((p, i) => (
            <li key={i} className="flex items-end gap-2">
              <Field label={tr.term} className="flex-1">
                {(id) => <Input id={id} type="number" min={1} max={60} required value={p.months} onChange={(e) => set("installment", s.installment.map((x, j) => (j === i ? { ...x, months: Number(e.target.value) } : x)))} />}
              </Field>
              <Field label={tr.markup} className="flex-1">
                {(id) => <Input id={id} type="number" min={0} max={200} step={0.5} required value={p.percent} onChange={(e) => set("installment", s.installment.map((x, j) => (j === i ? { ...x, percent: Number(e.target.value) } : x)))} />}
              </Field>
              <button type="button" aria-label={tr.removePlan(p.months)} onClick={() => set("installment", s.installment.filter((_, j) => j !== i))} className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-400 hover:bg-flame-50 hover:text-flame-600">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <Button variant="soft" size="sm" className="mt-3" disabled={s.installment.length >= 8} onClick={() => set("installment", [...s.installment, { months: 24, percent: 36 }])}>
          <Plus className="size-4" aria-hidden /> {tr.addTerm}
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
