"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { api, ApiError } from "@/shared/lib/api";
import type { Banner } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { Badge } from "@/shared/ui/Badge";
import { Button, IconButton } from "@/shared/ui/Button";
import { Checkbox, Field, Input, Select } from "@/shared/ui/Field";
import { Modal } from "@/shared/ui/Modal";
import { PageHeader } from "@/shared/ui/Page";
import { Alert, Empty, ErrorState, Loading } from "@/shared/ui/States";
import { ImageUploader } from "../ImageUploader";

const THEME: Record<Banner["theme"], { label: string; cls: string; sub: string }> = {
  dark: { label: "Qora", cls: "bg-ink-950 text-white", sub: "text-ink-300" },
  lime: { label: "Yashil (brend)", cls: "brand-gradient text-ink-950", sub: "text-ink-800" },
  light: { label: "Oq", cls: "bg-white text-ink-950 ring-1 ring-ink-100", sub: "text-ink-600" },
};

type Draft = Omit<Banner, "id">;
const EMPTY: Draft = { title: "", subtitle: "", image: null, link: "", cta: "Batafsil", theme: "dark", placement: "hero", sort: 0, active: true };

function Preview({ b }: { b: Draft }) {
  const t = THEME[b.theme];
  return (
    <div className={`relative flex overflow-hidden rounded-2xl p-5 ${b.placement === "hero" ? "h-44" : "h-32"} ${t.cls}`}>
      <div className="relative z-10 max-w-[58%]">
        <p className="font-display text-base font-bold leading-tight">{b.title || "Sarlavha"}</p>
        {b.subtitle ? <p className={`mt-1 line-clamp-2 text-xs ${t.sub}`}>{b.subtitle}</p> : null}
        {b.cta ? <p className="mt-2 text-xs font-semibold">{b.cta} →</p> : null}
      </div>
      {b.image ? (
        <div className="absolute inset-y-0 right-0 w-1/2">
          <Image src={b.image} alt="" fill sizes="240px" className="object-contain p-3" />
        </div>
      ) : null}
    </div>
  );
}

function BannerForm({ initial, onSaved }: { initial: Banner | null; onSaved: () => void }) {
  const [b, setB] = useState<Draft>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setB((s) => ({ ...s, [k]: v }));

  return (
    <form
      className="grid gap-5 md:grid-cols-[1fr_280px]"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
          if (initial) await api(`/banners/${initial.id}`, { method: "PATCH", json: b });
          else await api("/banners", { method: "POST", json: b });
          onSaved();
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Xatolik");
          setSaving(false);
        }
      }}
    >
      <div className="space-y-4">
        <Field label="Sarlavha">{(id) => <Input id={id} required minLength={2} maxLength={120} value={b.title} onChange={(e) => set("title", e.target.value)} />}</Field>
        <Field label="Matn">{(id) => <Input id={id} maxLength={240} value={b.subtitle} onChange={(e) => set("subtitle", e.target.value)} />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Havola" hint="/katalog/audio yoki https://…">
            {(id) => <Input id={id} maxLength={300} value={b.link ?? ""} onChange={(e) => set("link", e.target.value)} placeholder="/katalog?discount=1" />}
          </Field>
          <Field label="Tugma matni">{(id) => <Input id={id} maxLength={40} value={b.cta ?? ""} onChange={(e) => set("cta", e.target.value)} />}</Field>
          <Field label="Joylashuv">
            {(id) => (
              <Select id={id} value={b.placement} onChange={(e) => set("placement", e.target.value as Banner["placement"])}>
                <option value="hero">Asosiy karusel (katta)</option>
                <option value="promo">Promo blok (kichik)</option>
              </Select>
            )}
          </Field>
          <Field label="Rang">
            {(id) => (
              <Select id={id} value={b.theme} onChange={(e) => set("theme", e.target.value as Banner["theme"])}>
                {Object.entries(THEME).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Tartib">{(id) => <Input id={id} type="number" min={0} max={10000} value={b.sort} onChange={(e) => set("sort", Number(e.target.value))} />}</Field>
        </div>
        <ImageUploader label="Rasm" max={1} value={b.image ? [b.image] : []} onChange={(v) => set("image", v[0] ?? null)} />
        <Checkbox label="Faol" hint="O'chirilsa, banner saytda ko'rinmaydi" checked={b.active} onChange={(e) => set("active", e.target.checked)} />
        {error ? <Alert>{error}</Alert> : null}
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saqlanmoqda…" : "Saqlash"}
        </Button>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-600">Ko'rinishi</p>
        <Preview b={b} />
      </div>
    </form>
  );
}

export function BannersAdmin() {
  const { data, error, reload } = useApi<Banner[]>("/banners");
  const [edit, setEdit] = useState<Banner | null | "new">(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const remove = async (b: Banner) => {
    if (!confirm(`"${b.title}" bannerini o'chirasizmi?`)) return;
    try {
      await api(`/banners/${b.id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Xatolik");
    }
  };

  const groups: { key: Banner["placement"]; title: string }[] = [
    { key: "hero", title: "Asosiy karusel" },
    { key: "promo", title: "Promo bloklar" },
  ];

  return (
    <div>
      <PageHeader
        title="Bannerlar"
        subtitle="Bosh sahifadagi aksiyalar va reklama bloklari"
        action={
          <Button onClick={() => setEdit("new")}>
            <Plus className="size-4.5" aria-hidden /> Yangi banner
          </Button>
        }
      />
      {actionError ? <div className="mb-3"><Alert>{actionError}</Alert></div> : null}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <Loading />
      ) : !data.length ? (
        <Empty title="Banner yo'q" hint="Birinchi bannerni qo'shing — u bosh sahifada chiqadi." />
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.key}>
              <h2 className="mb-3 font-display text-base font-semibold">{g.title}</h2>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data
                  .filter((b) => b.placement === g.key)
                  .map((b) => (
                    <li key={b.id} className="rounded-2xl border border-ink-100 bg-white p-3 shadow-card">
                      <div className={b.active ? "" : "opacity-50"}>
                        <Preview b={b} />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 px-1">
                        <span className="flex items-center gap-2 text-xs text-ink-500">
                          <Badge tone={b.active ? "leaf" : "muted"}>{b.active ? "Faol" : "O'chiq"}</Badge>#{b.sort}
                        </span>
                        <span className="flex gap-1">
                          <IconButton label={`${b.title} — tahrirlash`} onClick={() => setEdit(b)}>
                            <Pencil className="size-4" />
                          </IconButton>
                          <IconButton label={`${b.title} — o'chirish`} onClick={() => remove(b)} className="hover:!bg-flame-50 hover:!text-flame-600">
                            <Trash2 className="size-4" />
                          </IconButton>
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      <Modal size="lg" open={edit !== null} title={edit === "new" ? "Yangi banner" : "Bannerni tahrirlash"} onClose={() => setEdit(null)}>
        {edit !== null ? (
          <BannerForm
            key={edit === "new" ? "new" : edit.id}
            initial={edit === "new" ? null : edit}
            onSaved={() => {
              setEdit(null);
              reload();
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
