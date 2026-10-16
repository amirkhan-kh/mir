/**
 * Refreshes the storefront mock (`frontend/src/shared/mock/data.json`) from the demo seed texts.
 * Numbers that come from a seeded database (stock, ratings, sold counts, dates, review spread) are kept;
 * every text field is rewritten in Russian with its Kyrgyz twin.
 *
 * Run from `backend/`: `npx tsx scripts/mock-data.ts`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BANNERS, CATEGORIES, PRODUCTS, REVIEWS, productTexts } from "../src/core/seed-data.js";
import { slugify } from "../src/core/text.js";
import { DEFAULT_STORE } from "../src/modules/settings/repository.js";

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend/src/shared/mock/data.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const imgOf = (images: string[]) => images[0]?.split("/")[3];

data.store = DEFAULT_STORE;

data.categories = data.categories.map((c: { slug: string }) => {
  const seed = CATEGORIES.find((x) => x.slug === c.slug);
  if (!seed) throw new Error(`No seed category for ${c.slug}`);
  return { ...c, name: seed.name, name_ky: seed.name_ky };
});

data.products = data.products.map((p: { images: string[] }, i: number) => {
  const seed = PRODUCTS[i];
  if (!seed || (p.images.length && imgOf(p.images) !== seed.img)) throw new Error(`Product #${i + 1} does not match seed order`);
  return { ...p, slug: slugify(seed.name), price: seed.price, old_price: seed.old ?? null, ...productTexts(seed) };
});

data.banners = data.banners.map((b: { placement: string; sort: number }) => {
  const seed = BANNERS.find((x) => x.placement === b.placement && x.sort === b.sort);
  if (!seed) throw new Error(`No seed banner for ${b.placement}#${b.sort}`);
  const { title, title_ky, subtitle, subtitle_ky, link, cta, cta_ky } = seed;
  return { ...b, title, title_ky, subtitle, subtitle_ky, link, cta, cta_ky };
});

/** Authors of earlier seeds, in `REVIEWS` order. */
const LEGACY_AUTHORS = ["Aziza", "Jasur", "Dilnoza", "Sardor", "Nodira", "Otabek", "Азиза", "Жасур", "Дилноза", "Сардор", "Нодира", "Отабек"];
data.reviews = data.reviews.map((r: { author: string; rating: number }) => {
  const legacy = LEGACY_AUTHORS.indexOf(r.author);
  const slot = legacy >= 0 ? legacy % REVIEWS.length : REVIEWS.findIndex(([a]) => a === r.author);
  if (slot < 0) return r;
  const [author, rating, text] = REVIEWS[slot];
  return { ...r, author, rating, text };
});

fs.writeFileSync(file, `${JSON.stringify(data)}\n`);
console.log(`mock data written: ${data.products.length} products, ${data.categories.length} categories, ${data.banners.length} banners`);
