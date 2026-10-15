"use client";

import { ArrowLeft, Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { ProductCard } from "@/features/storefront/ProductCard";
import { useLang, useT } from "@/shared/i18n/client";
import { api, ApiError } from "@/shared/lib/api";
import { discountPercent } from "@/shared/lib/format";
import { longestPlan } from "@/shared/lib/installment";
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
  name_ky: string;
  slug: string;
  sku: string;
  brand: string;
  short_description: string;
  short_description_ky: string;
  description: string;
  description_ky: string;
  price: string;
  old_price: string;
  stock: string;
  images: string[];
  specs: Spec[];
  specs_ky: Spec[];
  warranty_months: string;
  badge: string;
  badge_ky: string;
  is_featured: boolean;
  active: boolean;
}

/** Storefront badge texts: Russian value → Kyrgyz twin. */
const BADGES: [ru: string, ky: string][] = [
  ["Хит", "Хит"],
  ["Новинка", "Жаңы"],
  ["Топ", "Топ"],
  ["Скидка", "Арзандатуу"],
  ["Эксклюзив", "Эксклюзив"],
];

const toForm = (p: ProductFull | null): FormState => ({
  category_id: p ? String(p.category_id) : "",
  name: p?.name ?? "",
  name_ky: p?.name_ky ?? "",
  slug: p?.slug ?? "",
  sku: p?.sku ?? "",
  brand: p?.brand ?? "",
  short_description: p?.short_description ?? "",
  short_description_ky: p?.short_description_ky ?? "",
  description: p?.description ?? "",
  description_ky: p?.description_ky ?? "",
  price: p ? String(p.price) : "",
  old_price: p?.old_price ? String(p.old_price) : "",
  stock: p ? String(p.stock) : "0",
  images: p?.images ?? [],
  specs: p?.specs ?? [],
  specs_ky: p?.specs_ky ?? [],
  warranty_months: p ? String(p.warranty_months) : "12",
  badge: p?.badge ?? "",
  badge_ky: p?.badge_ky ?? "",
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

function SpecsEditor({ value, onChange, lang }: { value: Spec[]; onChange: (v: Spec[]) => void; lang?: string }) {
  const t = useT().admin.productForm;
  return (
    <>
      <ul className="space-y-2">
        {value.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <GripVertical className="size-4 shrink-0 text-ink-300" aria-hidden />
            <Input lang={lang} aria-label={t.specName(i + 1)} placeholder={t.specPlaceholder} maxLength={60} value={s.label} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <Input lang={lang} aria-label={t.specValue(i + 1)} placeholder='6.5" AMOLED' maxLength={200} value={s.value} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
            <button type="button" aria-label={t.specRemove(i + 1)} onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-400 hover:bg-flame-50 hover:text-flame-600">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <Button variant="soft" size="sm" disabled={value.length >= 40} onClick={() => onChange([...value, { label: "", value: "" }])}>
        <Plus className="size-4" aria-hidden /> {t.specAdd}
      </Button>
    </>
  );
}

function Editor({ initial, categories, store }: { initial: ProductFull | null; categories: Category[]; store: Store | null }) {
  const router = useRouter();
  const lang = useLang();
  const dict = useT();
  const t = dict.admin.productForm;
  const [f, setF] = useState<FormState>(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  const price = Number(f.price) || 0;
  const old = Number(f.old_price) || 0;
  const off = discountPercent(price, old || null);
  const clean = (specs: Spec[]) => specs.filter((s) => s.label.trim() && s.value.trim());

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
        specs: clean(f.specs),
        specs_ky: clean(f.specs_ky),
      };
      if (initial) await api(`/products/${initial.id}`, { method: "PATCH", json: body });
      else await api("/products", { method: "POST", json: body });
      router.push("/admin/tovarlar");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.common.error);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const ky = lang === "ky";
  const preview = {
    id: initial?.id ?? 0,
    slug: f.slug || "preview",
    name: (ky && f.name_ky) || f.name || t.previewName,
    brand: f.brand || null,
    price,
    old_price: old > price ? old : null,
    images: f.images,
    stock: Number(f.stock) || 0,
    badge: (ky && f.badge_ky) || f.badge || null,
    rating_avg: initial?.rating_avg ?? 0,
    rating_count: initial?.rating_count ?? 0,
    sold_count: initial?.sold_count ?? 0,
    category_id: Number(f.category_id) || 0,
  };
  const plan = store ? longestPlan(store.installment) : null;
  const known = BADGES.some(([ru]) => ru === f.badge);

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/tovarlar" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-950">
            <ArrowLeft className="size-4" aria-hidden /> {t.back}
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold">{initial ? dict.admin.editProductTitle : dict.admin.newProductTitle}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tovarlar" className="inline-flex h-11 items-center rounded-xl px-4 font-semibold text-ink-600 hover:bg-ink-100">
            {dict.common.cancel}
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? dict.common.saving : dict.common.save}
          </Button>
        </div>
      </div>
      {error ? <Alert>{error}</Alert> : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Section title={t.basics} hint={t.basicsHint}>
            <Field label={t.name} hint={t.nameHint}>
              {(id) => <Input id={id} required minLength={2} maxLength={160} value={f.name} onChange={(e) => set("name", e.target.value)} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.category}>
                {(id) => (
                  <Select id={id} required value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>
                    <option value="" disabled>
                      {t.choose}
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {(ky && c.name_ky) || c.name}
                        {c.active ? "" : t.hiddenSuffix}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label={t.brand}>{(id) => <Input id={id} maxLength={60} value={f.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Samsung" />}</Field>
              <Field label={t.sku} hint={t.skuHint}>
                {(id) => <Input id={id} maxLength={60} value={f.sku} onChange={(e) => set("sku", e.target.value)} placeholder="MIR-0001" />}
              </Field>
              <Field label={t.slug} hint={t.slugHint}>
                {(id) => <Input id={id} maxLength={80} value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="samsung-galaxy-a55" />}
              </Field>
            </div>
          </Section>

          <Section title={t.priceStock}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label={t.price}>
                {(id) => <Input id={id} type="number" required min={0} step={1000} value={f.price} onChange={(e) => set("price", e.target.value)} />}
              </Field>
              <Field label={t.oldPrice} hint={off ? t.discount(off) : t.ifDiscount} error={old && old <= price ? t.oldPriceError : null}>
                {(id) => <Input id={id} type="number" min={0} step={1000} value={f.old_price} onChange={(e) => set("old_price", e.target.value)} />}
              </Field>
              <Field label={t.stock} hint={t.stockHint}>
                {(id) => <Input id={id} type="number" required min={0} max={1000000} value={f.stock} onChange={(e) => set("stock", e.target.value)} />}
              </Field>
              <Field label={t.warranty}>
                {(id) => <Input id={id} type="number" min={0} max={120} value={f.warranty_months} onChange={(e) => set("warranty_months", e.target.value)} />}
              </Field>
            </div>
          </Section>

          <Section title={t.images}>
            <ImageUploader value={f.images} onChange={(v) => set("images", v)} />
          </Section>

          <Section title={t.description}>
            <Field label={t.short} hint={t.shortHint}>
              {(id) => <Textarea id={id} maxLength={300} className="min-h-20" value={f.short_description} onChange={(e) => set("short_description", e.target.value)} />}
            </Field>
            <Field label={t.full}>{(id) => <Textarea id={id} maxLength={10000} className="min-h-40" value={f.description} onChange={(e) => set("description", e.target.value)} />}</Field>
          </Section>

          <Section title={t.specs} hint={t.specsHint}>
            <SpecsEditor value={f.specs} onChange={(v) => set("specs", v)} />
          </Section>

          <Section title={t.kyTitle} hint={dict.admin.kyHint}>
            <Field label={t.kyName}>
              {(id) => <Input id={id} lang="ky" maxLength={160} value={f.name_ky} onChange={(e) => set("name_ky", e.target.value)} />}
            </Field>
            <Field label={t.kyShort}>
              {(id) => <Textarea id={id} lang="ky" maxLength={300} className="min-h-20" value={f.short_description_ky} onChange={(e) => set("short_description_ky", e.target.value)} />}
            </Field>
            <Field label={t.kyFull}>
              {(id) => <Textarea id={id} lang="ky" maxLength={10000} className="min-h-40" value={f.description_ky} onChange={(e) => set("description_ky", e.target.value)} />}
            </Field>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink-800">{t.kySpecs}</p>
                {!f.specs_ky.length && f.specs.length ? (
                  <Button variant="soft" size="sm" onClick={() => set("specs_ky", f.specs.map((s) => ({ ...s })))}>
                    <Copy className="size-4" aria-hidden /> {t.kyCopy}
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-ink-500">{t.kySpecsHint}</p>
              <SpecsEditor lang="ky" value={f.specs_ky} onChange={(v) => set("specs_ky", v)} />
            </div>
          </Section>
        </div>

        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Section title={t.visibility}>
            <Checkbox label={t.active} hint={t.activeHint} checked={f.active} onChange={(e) => set("active", e.target.checked)} />
            <Checkbox label={t.featured} hint={t.featuredHint} checked={f.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />
            <Field label={t.badge}>
              {(id) => (
                <Select
                  id={id}
                  value={f.badge}
                  onChange={(e) => {
                    const pair = BADGES.find(([ru]) => ru === e.target.value);
                    setF((s) => ({ ...s, badge: e.target.value, badge_ky: pair?.[1] ?? "" }));
                  }}
                >
                  <option value="">{t.noBadge}</option>
                  {!known && f.badge ? <option value={f.badge}>{f.badge}</option> : null}
                  {BADGES.map(([ru, kyText]) => (
                    <option key={ru} value={ru}>
                      {ky ? kyText : ru}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </Section>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink-600">{t.preview}</p>
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
