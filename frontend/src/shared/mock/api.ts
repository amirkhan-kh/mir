import type { Banner, Category, ProductCard, ProductDetail, ProductList, Review, Store } from "@/shared/lib/types";
import data from "./data.json";

/**
 * Read-only stand-in for the public API while the backend is disconnected.
 * `data.json` is generated from `backend/src/core/seed-data.ts`; mirrors the backend's filters and sort order.
 */

type MockProduct = Omit<ProductDetail, "category_name" | "category_slug" | "related" | "reviews" | "rating_breakdown"> & {
  created_at: string;
};

const store = data.store as Store;
const categories = data.categories as Omit<Category, "product_count">[];
const products = data.products as MockProduct[];
const banners = data.banners as Banner[];
const reviews = data.reviews as (Review & { product_id: number })[];

const activeCats = new Map(categories.filter((c) => c.active).map((c) => [c.id, c]));
const visible = products.filter((p) => activeCats.has(p.category_id));

const card = (p: MockProduct): ProductCard => ({
  id: p.id, slug: p.slug, name: p.name, brand: p.brand, price: p.price, old_price: p.old_price,
  images: p.images.slice(0, 2), stock: p.stock, badge: p.badge, rating_avg: p.rating_avg,
  rating_count: p.rating_count, sold_count: p.sold_count, category_id: p.category_id,
});

const withCount = (c: Omit<Category, "product_count">): Category => ({
  ...c,
  product_count: products.filter((p) => p.category_id === c.id).length,
});

const discountShare = (p: MockProduct) => (p.old_price ? (p.old_price - p.price) / p.old_price : 0);

const SORTS: Record<string, (a: MockProduct, b: MockProduct) => number> = {
  popular: (a, b) => Number(b.is_featured) - Number(a.is_featured) || b.sold_count - a.sold_count || b.id - a.id,
  new: (a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id,
  cheap: (a, b) => a.price - b.price || a.id - b.id,
  expensive: (a, b) => b.price - a.price || a.id - b.id,
  rating: (a, b) => b.rating_avg - a.rating_avg || b.rating_count - a.rating_count || a.id - b.id,
  discount: (a, b) => discountShare(b) - discountShare(a) || a.id - b.id,
};

const flag = (v: string | null) => v === "1" || v === "true";
const num = (v: string | null) => (v === null || v === "" || Number.isNaN(Number(v)) ? null : Number(v));
const csv = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

function listProducts(sp: URLSearchParams): ProductList {
  const q = (sp.get("q") ?? "").trim().toLowerCase();
  const category = sp.get("category") ?? "";
  const brands = csv(sp.get("brand")).map((b) => b.toLowerCase());
  const min = num(sp.get("min"));
  const max = num(sp.get("max"));
  const ids = csv(sp.get("ids")).map(Number);
  const sort = SORTS[sp.get("sort") ?? ""] ?? SORTS.popular;
  const page = Math.max(1, Math.floor(num(sp.get("page")) ?? 1));
  const limit = Math.min(60, Math.max(1, Math.floor(num(sp.get("limit")) ?? 24)));

  const base = visible.filter(
    (p) =>
      (!q || [p.name, p.brand ?? "", p.sku ?? ""].some((s) => s.toLowerCase().includes(q))) &&
      (!category || activeCats.get(p.category_id)?.slug === category) &&
      (!ids.length || ids.includes(p.id)) &&
      (!flag(sp.get("discount")) || p.old_price !== null) &&
      (!flag(sp.get("featured")) || p.is_featured) &&
      (!flag(sp.get("in_stock")) || p.stock > 0),
  );
  const matched = base
    .filter(
      (p) =>
        (!brands.length || brands.includes((p.brand ?? "").toLowerCase())) &&
        (min === null || p.price >= min) &&
        (max === null || p.price <= max),
    )
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || sort(a, b));

  const brandCounts = new Map<string, number>();
  for (const p of base) if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const prices = base.map((p) => p.price);

  return {
    items: matched.slice((page - 1) * limit, page * limit).map(card),
    total: matched.length,
    page,
    limit,
    facets: {
      brands: [...brandCounts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      price: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
    },
  };
}

function productDetail(slug: string): ProductDetail | null {
  const p = visible.find((x) => x.slug === slug);
  if (!p) return null;
  const cat = activeCats.get(p.category_id)!;
  const own = reviews.filter((r) => r.product_id === p.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const breakdown: Record<string, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of own) breakdown[r.rating] += 1;
  const { created_at: _created, ...rest } = p;
  return {
    ...rest,
    category_name: cat.name,
    category_slug: cat.slug,
    related: visible
      .filter((x) => x.category_id === p.category_id && x.id !== p.id)
      .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || b.sold_count - a.sold_count)
      .slice(0, 10)
      .map(card),
    reviews: own.slice(0, 20).map(({ product_id: _pid, ...r }) => r),
    rating_breakdown: breakdown,
  };
}

/** GET `/public/...` (path relative to `/api/v1`, may include a query string). `undefined` means 404. */
export function mockGet(pathWithQuery: string): unknown {
  const url = new URL(pathWithQuery, "http://mock");
  const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  if (parts[0] !== "public") return undefined;
  const [, resource, id] = parts;
  switch (resource) {
    case "settings":
      return id ? undefined : store;
    case "banners":
      return id ? undefined : banners.filter((b) => b.active);
    case "categories": {
      if (!id) return [...activeCats.values()].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name)).map(withCount);
      const c = [...activeCats.values()].find((x) => x.slug === id);
      return c ? withCount(c) : undefined;
    }
    case "products":
      return id ? (productDetail(id) ?? undefined) : listProducts(url.searchParams);
    default:
      return undefined;
  }
}

/** POST `/public/orders/quote`: same shape as the backend quote, priced from mock data. */
export function mockQuote(lines: { product_id: number; qty: number }[]) {
  const merged = new Map<number, number>();
  for (const l of lines) merged.set(l.product_id, Math.min(99, (merged.get(l.product_id) ?? 0) + l.qty));
  const items = [...merged].map(([productId, qty]) => {
    const p = visible.find((x) => x.id === productId);
    if (!p) return { product_id: productId, qty, available: false, problem: "Sotuvda yo'q" };
    const problem = p.stock === 0 ? "Tugagan" : p.stock < qty ? `Faqat ${p.stock} dona qoldi` : null;
    return {
      id: p.id, name: p.name, slug: p.slug, price: p.price, old_price: p.old_price, stock: p.stock,
      image: p.images[0] ?? null, available: true, product_id: p.id, qty, line_total: p.price * qty, problem,
    };
  });
  const subtotal = items.reduce((s, i) => s + (i.problem ? 0 : (i as { line_total: number }).line_total), 0);
  return {
    items,
    subtotal,
    delivery_fee: subtotal < store.free_delivery_from ? store.delivery_fee : 0,
    free_delivery_from: store.free_delivery_from,
    installment: store.installment.map((p) => {
      const total = Math.round(subtotal * (1 + p.percent / 100));
      return { ...p, total, monthly: Math.ceil(total / p.months) };
    }),
  };
}
