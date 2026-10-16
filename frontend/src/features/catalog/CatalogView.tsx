import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/features/storefront/ProductCard";
import { getT } from "@/shared/i18n/server";
import { longestPlan } from "@/shared/lib/installment";
import { getStore, serverGet } from "@/shared/lib/server";
import type { Category, ProductList } from "@/shared/lib/types";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { Empty } from "@/shared/ui/States";
import { CatalogFilters, MobileFilters, SortSelect } from "./CatalogFilters";

export type SearchParams = Record<string, string | string[] | undefined>;

const KEYS = ["q", "brand", "min", "max", "sort", "discount", "featured", "in_stock", "page"];
const LIMIT = 20;

function pick(sp: SearchParams) {
  const out = new URLSearchParams();
  for (const k of KEYS) {
    const v = sp[k];
    const s = Array.isArray(v) ? v[0] : v;
    if (s) out.set(k, s.slice(0, 120));
  }
  return out;
}

export async function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const t = await getT();
  return (
    <nav aria-label={t.nav.breadcrumbs} className="mb-3 text-sm text-ink-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((i, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            {idx > 0 ? <ChevronRight className="size-3.5 text-ink-300" aria-hidden /> : null}
            {i.href ? (
              <Link href={i.href} className="hover:text-ink-950">
                {i.label}
              </Link>
            ) : (
              <span aria-current="page" className="line-clamp-1 text-ink-800">
                {i.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export async function CatalogView({ sp, category, categories }: { sp: SearchParams; category: Category | null; categories: Category[] }) {
  const t = await getT();
  const params = pick(sp);
  const page = Math.max(1, Number(params.get("page")) || 1);
  const api = new URLSearchParams(params);
  api.set("limit", String(LIMIT));
  if (category) api.set("category", category.slug);
  const [list, store] = await Promise.all([serverGet<ProductList>(`/public/products?${api}`), getStore()]);
  const data = list ?? { items: [], total: 0, page: 1, limit: LIMIT, facets: { brands: [], price: { min: 0, max: 0 } } };
  const pages = Math.max(1, Math.ceil(data.total / LIMIT));
  const q = params.get("q");
  const title = q ? t.catalog.results(q) : category?.name ?? (params.get("discount") ? t.catalog.discounts : params.get("featured") ? t.catalog.popular : t.catalog.all);
  const base = category ? `/katalog/${category.slug}` : "/katalog";
  const pageHref = (p: number) => {
    const n = new URLSearchParams(params);
    if (p > 1) n.set("page", String(p));
    else n.delete("page");
    return `${base}${n.size ? `?${n}` : ""}`;
  };

  return (
    <div>
      <Breadcrumbs items={[{ href: "/", label: t.nav.home }, { href: category ? "/katalog" : undefined, label: t.nav.catalog }, ...(category ? [{ label: category.name }] : [])]} />
      <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
        <h1 className="flex flex-wrap items-baseline gap-x-3 font-display text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
          {title}
          <span className="font-sans text-sm font-normal tracking-normal text-ink-500">{t.nav.productsCount(data.total)}</span>
        </h1>
        <div className="hidden shrink-0 lg:block">
          <SortSelect />
        </div>
      </div>

      {!category && !q ? (
        <ul className="scrollbar-none -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:mb-4 sm:px-0">
          {categories.filter((c) => c.product_count > 0).map((c) => (
            <li key={c.id} className="shrink-0">
              <Link href={`/katalog/${c.slug}`} className="flex h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-white px-3 text-sm font-semibold text-ink-800 ring-1 ring-ink-100 hover:ring-ink-300">
                <CategoryIcon name={c.icon} className="size-4.5 text-leaf-700" />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-5">
        <CatalogFilters facets={data.facets} />
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
            <MobileFilters facets={data.facets} />
            <SortSelect />
          </div>
          {data.items.length ? (
            <ProductGrid products={data.items} plan={longestPlan(store.installment)} preloadFirst={4} layout="sidebar" />
          ) : (
            <div className="rounded-3xl bg-white">
              <Empty
                icon={<SearchX className="size-6" aria-hidden />}
                title={t.catalog.notFound}
                hint={t.catalog.notFoundHint}
                action={
                  <Link href={base} className="text-sm font-semibold text-leaf-700 hover:underline">
                    {t.catalog.clear}
                  </Link>
                }
              />
            </div>
          )}
          {pages > 1 ? (
            <nav aria-label={t.catalog.pages} className="mt-6 flex items-center justify-center gap-2">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} aria-label={t.common.prevPage} className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-ink-200 hover:ring-ink-400">
                  <ChevronLeft className="size-4" />
                </Link>
              ) : null}
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <span key={p} className="flex items-center gap-2">
                    {i > 0 && p - arr[i - 1] > 1 ? <span className="text-ink-400">…</span> : null}
                    <Link
                      href={pageHref(p)}
                      aria-current={p === page ? "page" : undefined}
                      className={`grid size-10 place-items-center rounded-xl text-sm font-semibold ${p === page ? "bg-ink-950 text-white" : "bg-white ring-1 ring-ink-200 hover:ring-ink-400"}`}
                    >
                      {p}
                    </Link>
                  </span>
                ))}
              {page < pages ? (
                <Link href={pageHref(page + 1)} aria-label={t.common.nextPage} className="grid size-10 place-items-center rounded-xl bg-white ring-1 ring-ink-200 hover:ring-ink-400">
                  <ChevronRight className="size-4" />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
