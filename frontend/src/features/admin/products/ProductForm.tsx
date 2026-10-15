"use client";

import { ArrowLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { ProductCard } from "@/features/storefront/ProductCard";
import { api, ApiError } from "@/shared/lib/api";
import { discountPercent } from "@/shared/lib/format";
import type { Category, ProductFull, Spec, Store } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { Button } from "@/shared/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/shared/ui/Field";
import { Card } from "@/shared/ui/Page";
import { Alert, ErrorState, Loading } from "@/shared/ui/States";
import { ImageUploader } from "../ImageUploader";

interface FormState {
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  short_description: string;
  description: string;
  price: string;
  old_price: string;
  stock: string;
  images: string[];
  specs: Spec[];
  warranty_months: string;
  badge: string;
  is_featured: boolean;
  active: boolean;
}

const BADGES = ["", "Hit", "Yangi", "Top", "Chegirma", "Eksklyuziv"];

const toForm = (p: ProductFull | null): FormState => ({
  category_id: p ? String(p.category_id) : "",
  name: p?.name ?? "",
  slug: p?.slug ?? "",
  sku: p?.sku ?? "",
  brand: p?.brand ?? "",
  short_description: p?.short_description ?? "",
  description: p?.description ?? "",
  price: p ? String(p.price) : "",
  old_price: p?.old_price ? String(p.old_price) : "",
  stock: p ? String(p.stock) : "0",
  images: p?.images ?? [],
  specs: p?.specs ?? [],
  warranty_months: p ? String(p.warranty_months) : "12",
  badge: p?.badge ?? "",
  is_featured: p?.is_featured ?? false,
  active: p?.active ?? true,
});

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      {hint ? <p className="mt-0.5 text-sm text-ink-500">{hint}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </Card>
  );
}

function Editor({ initial, categories, store }: { initial: ProductFull | null; categories: Category[]; store: Store | null }) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  const price = Number(f.price) || 0;
  const old = Number(f.old_price) || 0;
  const off = discountPercent(price, old || null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        ...f,
        category_id: Number(f.category_id),
        price,
        old_price: old || null,
        stock: Number(f.stock) || 0,
        warranty_months: Number(f.warranty_months) || 0,
        specs: f.specs.filter((s) => s.label.trim() && s.value.trim()),
      };
      if (initial) await api(`/products/${initial.id}`, { method: "PATCH", json: body });
      else await api("/products", { method: "POST", json: body });
      router.push("/admin/tovarlar");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xatolik");
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const preview = {
    id: initial?.id ?? 0,
    slug: f.slug || "preview",
    name: f.name || "Tovar nomi",
    brand: f.brand || null,
    price,
    old_price: old > price ? old : null,
    images: f.images,
    stock: Number(f.stock) || 0,
    badge: f.badge || null,
    rating_avg: initial?.rating_avg ?? 0,
    rating_count: initial?.rating_count ?? 0,
    sold_count: initial?.sold_count ?? 0,
    category_id: Number(f.category_id) || 0,
  };
  const plan = store?.installment.reduce<Store["installment"][number] | null>((b, p) => (!b || p.months > b.months ? p : b), null) ?? null;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/tovarlar" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-950">
            <ArrowLeft className="size-4" aria-hidden /> Tovarlar
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold">{initial ? "Tovarni tahrirlash" : "Yangi tovar"}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tovarlar" className="inline-flex h-11 items-center rounded-xl px-4 font-semibold text-ink-600 hover:bg-ink-100">
            Bekor qilish
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? "Saqlanmoqda…" : "Saqlash"}
          </Button>
        </div>
      </div>
      {error ? <Alert>{error}</Alert> : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Section title="Asosiy ma'lumot" hint="Mijoz katalog va qidiruvda aynan shu nomni ko'radi">
            <Field label="Nomi" hint="Brend + model + asosiy xususiyat. Masalan: Samsung Galaxy A55 8/256 GB">
              {(id) => <Input id={id} required minLength={2} maxLength={160} value={f.name} onChange={(e) => set("name", e.target.value)} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategoriya">
                {(id) => (
                  <Select id={id} required value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>
                    <option value="" disabled>
                      Tanlang
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.active ? "" : " (yashirin)"}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Brend">{(id) => <Input id={id} maxLength={60} value={f.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Samsung" />}</Field>
              <Field label="SKU (artikul)" hint="Ixtiyoriy, takrorlanmas">
                {(id) => <Input id={id} maxLength={60} value={f.sku} onChange={(e) => set("sku", e.target.value)} placeholder="MIR-0001" />}
              </Field>
              <Field label="Sahifa manzili (slug)" hint="Bo'sh qolsa nomdan avtomatik yasaladi">
                {(id) => <Input id={id} maxLength={80} value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="samsung-galaxy-a55" />}
              </Field>
            </div>
          </Section>

          <Section title="Narx va qoldiq">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Narx, so'm">
                {(id) => <Input id={id} type="number" required min={0} step={1000} value={f.price} onChange={(e) => set("price", e.target.value)} />}
              </Field>
              <Field label="Eski narx, so'm" hint={off ? `Chegirma: −${off}%` : "Chegirma bo'lsa"} error={old && old <= price ? "Eski narx joriy narxdan katta bo'lsin" : null}>
                {(id) => <Input id={id} type="number" min={0} step={1000} value={f.old_price} onChange={(e) => set("old_price", e.target.value)} />}
              </Field>
              <Field label="Qoldiq, dona" hint="0 bo'lsa «Sotuvda yo'q»">
                {(id) => <Input id={id} type="number" required min={0} max={1000000} value={f.stock} onChange={(e) => set("stock", e.target.value)} />}
              </Field>
              <Field label="Kafolat, oy">
                {(id) => <Input id={id} type="number" min={0} max={120} value={f.warranty_months} onChange={(e) => set("warranty_months", e.target.value)} />}
              </Field>
            </div>
          </Section>

          <Section title="Rasmlar">
            <ImageUploader value={f.images} onChange={(v) => set("images", v)} />
          </Section>

          <Section title="Tavsif">
            <Field label="Qisqa tavsif" hint="1–2 gap: tovar sahifasida nom ostida chiqadi">
              {(id) => <Textarea id={id} maxLength={300} className="min-h-20" value={f.short_description} onChange={(e) => set("short_description", e.target.value)} />}
            </Field>
            <Field label="To'liq tavsif">{(id) => <Textarea id={id} maxLength={10000} className="min-h-40" value={f.description} onChange={(e) => set("description", e.target.value)} />}</Field>
          </Section>

          <Section title="Xususiyatlar" hint="Birinchi 6 tasi tovar sahifasining yuqorisida ko'rsatiladi">
            <ul className="space-y-2">
              {f.specs.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <GripVertical className="size-4 shrink-0 text-ink-300" aria-hidden />
                  <Input aria-label={`${i + 1}-xususiyat nomi`} placeholder="Ekran" maxLength={60} value={s.label} onChange={(e) => set("specs", f.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  <Input aria-label={`${i + 1}-xususiyat qiymati`} placeholder='6.5" AMOLED' maxLength={200} value={s.value} onChange={(e) => set("specs", f.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                  <button type="button" aria-label={`${i + 1}-xususiyatni o'chirish`} onClick={() => set("specs", f.specs.filter((_, j) => j !== i))} className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-400 hover:bg-flame-50 hover:text-flame-600">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Button variant="soft" size="sm" disabled={f.specs.length >= 40} onClick={() => set("specs", [...f.specs, { label: "", value: "" }])}>
              <Plus className="size-4" aria-hidden /> Xususiyat qo'shish
            </Button>
          </Section>
        </div>

        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Section title="Saytda ko'rinishi">
            <Checkbox label="Sotuvda" hint="O'chirilsa, tovar saytdan yashiriladi" checked={f.active} onChange={(e) => set("active", e.target.checked)} />
            <Checkbox label="Ommabop" hint="Bosh sahifadagi «Ommabop tovarlar»da" checked={f.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />
            <Field label="Yorliq (badge)">
              {(id) => (
                <Select id={id} value={f.badge} onChange={(e) => set("badge", e.target.value)}>
                  {BADGES.map((b) => (
                    <option key={b} value={b}>
                      {b || "Yo'q"}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </Section>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink-600">Karta ko'rinishi</p>
            <div className="pointer-events-none mx-auto max-w-60 rounded-2xl ring-1 ring-ink-100" inert>
              <ProductCard product={preview} plan={plan} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export function ProductForm({ id }: { id?: string }) {
  const product = useApi<ProductFull>(id ? `/products/${id}` : null);
  const categories = useApi<Category[]>("/categories");
  const store = useApi<Store>("/public/settings");
  const err = product.error ?? categories.error;
  if (err) return <ErrorState message={err} onRetry={() => (product.reload(), categories.reload())} />;
  if ((id && !product.data) || !categories.data) return <Loading />;
  return <Editor initial={product.data} categories={categories.data} store={store.data} />;
}
