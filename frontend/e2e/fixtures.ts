import { test as base, expect, type APIRequestContext, type Page } from "@playwright/test";
import { ru } from "../src/shared/i18n/ru";
import type { CartLine } from "../src/features/cart/store";
import type { ProductCard, ProductList } from "../src/shared/lib/types";

export { expect, ru };

export const BACKEND = process.env.E2E_BACKEND === "1";

/** Body shape of every API error. */
export interface ApiErr {
  error: string;
  fields?: Record<string, string>;
}

type Guard = { errors: string[]; allow: (re: RegExp) => void };

type Fixtures = {
  /** Fails the test on console errors, page errors and unexpected 5xx responses (TESTING.md done bar #3). */
  guard: Guard;
  /** Products visible on the storefront, fetched once per test — never hardcode seeded values. */
  catalog: Catalog;
  /** Pre-fills `localStorage` cart / favorites before the first navigation. */
  shopper: Shopper;
  /** Unique suffix: differs across repeats so UNIQUE columns never collide. */
  unique: (prefix?: string) => string;
};

export interface Catalog {
  all: ProductCard[];
  /** In stock, has a discount (old_price) and at least 2 images. */
  rich: ProductCard;
  inStock: ProductCard[];
  outOfStock: ProductCard | undefined;
  byId: (id: number) => ProductCard;
}

export interface Shopper {
  setCart: (lines: CartLine[]) => Promise<void>;
  setFavorites: (ids: number[]) => Promise<void>;
  cart: () => Promise<CartLine[]>;
  favorites: () => Promise<number[]>;
  line: (p: ProductCard, qty?: number) => CartLine;
}

export async function loadCatalog(request: APIRequestContext): Promise<Catalog> {
  const res = await request.get("/api/v1/public/products?limit=60&sort=popular");
  expect(res.ok(), "catalog must load").toBeTruthy();
  const { items: all } = (await res.json()) as ProductList;
  const inStock = all.filter((p) => p.stock > 0);
  const rich = inStock.find((p) => p.old_price && p.images.length >= 2) ?? inStock.find((p) => p.images.length >= 2) ?? inStock[0];
  expect(rich, "need at least one purchasable product").toBeTruthy();
  return {
    all,
    rich,
    inStock,
    outOfStock: all.find((p) => p.stock === 0),
    byId: (id) => {
      const p = all.find((x) => x.id === id);
      if (!p) throw new Error(`product ${id} not in catalog`);
      return p;
    },
  };
}

function shopperFor(page: Page): Shopper {
  const write = async (key: string, value: unknown) => {
    // Storage is per-origin: land on a tiny page of the app first, then write.
    if (page.url() === "about:blank") await page.goto("/robots.txt");
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, JSON.stringify(value)] as const);
  };
  return {
    setCart: (lines) => write("mir_cart", lines),
    setFavorites: (ids) => write("mir_fav", ids),
    cart: () => page.evaluate(() => JSON.parse(localStorage.getItem("mir_cart") ?? "[]") as CartLine[]),
    favorites: () => page.evaluate(() => JSON.parse(localStorage.getItem("mir_fav") ?? "[]") as number[]),
    line: (p, qty = 1) => ({ id: p.id, qty, slug: p.slug, name: p.name, price: p.price, image: p.images[0] ?? null, stock: p.stock }),
  };
}

export const test = base.extend<Fixtures>({
  guard: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      const allowed: RegExp[] = [];
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
      page.on("console", (m) => {
        if (m.type() !== "error") return;
        const text = m.text();
        // Resource 404s (e.g. an intentionally missing route) are asserted by the test itself.
        if (/Failed to load resource/.test(text)) return;
        errors.push(`console: ${text}`);
      });
      page.on("response", (r) => {
        if (r.status() >= 500) errors.push(`${r.status()} ${r.request().method()} ${r.url()}`);
      });
      await use({ errors, allow: (re) => allowed.push(re) });
      const left = errors.filter((e) => !allowed.some((re) => re.test(e)));
      if (testInfo.status === testInfo.expectedStatus) expect(left, "no console / page / 5xx errors").toEqual([]);
    },
    { auto: true },
  ],
  catalog: async ({ request }, use) => {
    await use(await loadCatalog(request));
  },
  shopper: async ({ page }, use) => {
    await use(shopperFor(page));
  },
  unique: async ({}, use, testInfo) => {
    await use((prefix = "e2e") => `${prefix}-${Date.now().toString(36)}-${testInfo.repeatEachIndex}-${testInfo.workerIndex}`);
  },
});

/** Reads the formatted money shown in the UI back to a number: "9 490 000 сум" → 9490000. */
export const parseMoney = (s: string) => Number(s.replace(/[^\d]/g, ""));

/** Mirrors `formatMoney` without importing Intl assumptions into tests. */
export const money = (n: number) => `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n)).replace(/\u00a0|\u202f/g, " ")} сум`;
