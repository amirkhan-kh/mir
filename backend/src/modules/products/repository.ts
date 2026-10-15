import type { Db } from "../../core/db.js";
import { col, type Lang } from "../../core/i18n.js";

export interface ProductInput {
  category_id: number;
  name: string;
  name_ky: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  short_description: string;
  short_description_ky: string;
  description: string;
  description_ky: string;
  price: number;
  old_price: number | null;
  stock: number;
  images: string[];
  specs: { label: string; value: string }[];
  specs_ky: { label: string; value: string }[];
  warranty_months: number;
  badge: string | null;
  badge_ky: string;
  is_featured: boolean;
  active: boolean;
}

export interface PublicFilter {
  q: string;
  category: string;
  brands: string[];
  min: number | null;
  max: number | null;
  sort: keyof typeof SORTS;
  discount: boolean;
  featured: boolean;
  inStock: boolean;
  ids: number[];
  limit: number;
  offset: number;
}

export const SORTS = {
  popular: "p.is_featured DESC, p.sold_count DESC, p.id DESC",
  new: "p.created_at DESC, p.id DESC",
  cheap: "p.price ASC, p.id",
  expensive: "p.price DESC, p.id",
  rating: "p.rating_avg DESC, p.rating_count DESC, p.id",
  discount: "(COALESCE(p.old_price, p.price) - p.price) / NULLIF(COALESCE(p.old_price, p.price), 0) DESC, p.id",
} as const;

export const card = (lang: Lang) => `p.id, p.slug, ${col(lang, "p.name")}, p.brand, p.price, p.old_price, p.images[1:2] AS images,
  p.stock, ${col(lang, "p.badge")}, p.rating_avg, p.rating_count, p.sold_count, p.category_id`;

const specs = (lang: Lang) =>
  lang === "ky" ? "CASE WHEN jsonb_array_length(p.specs_ky) > 0 THEN p.specs_ky ELSE p.specs END AS specs" : "p.specs";

/** Public filter: every user value goes through $n params; clauses are fixed strings. */
function publicWhere(f: Omit<PublicFilter, "sort" | "limit" | "offset">) {
  const params: unknown[] = [];
  const where = ["p.active", "c.active"];
  const add = (sql: string, value: unknown) => {
    params.push(value);
    where.push(sql.replaceAll("$?", `$${params.length}`));
  };
  if (f.q) add("(p.name ILIKE $? OR p.name_ky ILIKE $? OR p.brand ILIKE $? OR p.sku ILIKE $?)", `%${f.q}%`);
  if (f.category) add("c.slug = $?", f.category);
  if (f.brands.length) add("lower(p.brand) = ANY($?)", f.brands.map((b) => b.toLowerCase()));
  if (f.min !== null) add("p.price >= $?", f.min);
  if (f.max !== null) add("p.price <= $?", f.max);
  if (f.ids.length) add("p.id = ANY($?)", f.ids);
  if (f.discount) where.push("p.old_price IS NOT NULL");
  if (f.featured) where.push("p.is_featured");
  if (f.inStock) where.push("p.stock > 0");
  return { sql: where.join(" AND "), params };
}

export async function listPublic(db: Db, f: PublicFilter, lang: Lang) {
  const { sql, params } = publicWhere(f);
  const n = params.length;
  const [items, total] = await Promise.all([
    db.query(
      `SELECT ${card(lang)} FROM products p JOIN categories c ON c.id = p.category_id
        WHERE ${sql} ORDER BY (p.stock > 0) DESC, ${SORTS[f.sort]} LIMIT $${n + 1} OFFSET $${n + 2}`,
      [...params, f.limit, f.offset],
    ),
    db.query(`SELECT COUNT(*) AS n FROM products p JOIN categories c ON c.id = p.category_id WHERE ${sql}`, params),
  ]);
  return { items: items.rows, total: total.rows[0].n as number };
}

export async function facets(db: Db, f: Omit<PublicFilter, "sort" | "limit" | "offset">) {
  const { sql, params } = publicWhere({ ...f, brands: [], min: null, max: null });
  const [brands, range] = await Promise.all([
    db.query(
      `SELECT p.brand AS name, COUNT(*) AS count FROM products p JOIN categories c ON c.id = p.category_id
        WHERE ${sql} AND p.brand IS NOT NULL AND p.brand <> '' GROUP BY p.brand ORDER BY count DESC, p.brand LIMIT 30`,
      params,
    ),
    db.query(
      `SELECT COALESCE(MIN(p.price), 0) AS min, COALESCE(MAX(p.price), 0) AS max
         FROM products p JOIN categories c ON c.id = p.category_id WHERE ${sql}`,
      params,
    ),
  ]);
  return { brands: brands.rows, price: range.rows[0] };
}

export async function bySlug(db: Db, slug: string, lang: Lang) {
  const { rows } = await db.query(
    `SELECT p.id, p.slug, ${col(lang, "p.name")}, p.brand, p.price, p.old_price, p.images, p.stock, ${col(lang, "p.badge")},
            p.rating_avg, p.rating_count, p.sold_count, p.category_id, p.sku, ${col(lang, "p.short_description")},
            ${col(lang, "p.description")}, ${specs(lang)}, p.warranty_months, p.is_featured,
            ${col(lang, "c.name", "category_name")}, c.slug AS category_slug
       FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.slug = $1 AND p.active AND c.active`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function related(db: Db, categoryId: number, excludeId: number, lang: Lang) {
  const { rows } = await db.query(
    `SELECT ${card(lang)} FROM products p WHERE p.active AND p.category_id = $1 AND p.id <> $2
      ORDER BY (p.stock > 0) DESC, p.sold_count DESC LIMIT 10`,
    [categoryId, excludeId],
  );
  return rows;
}

export async function listAdmin(
  db: Db,
  f: { q: string; status: string; category_id: number | null; limit: number; offset: number },
) {
  const where = [
    "($1 = '' OR p.name ILIKE '%' || $1 || '%' OR p.sku ILIKE '%' || $1 || '%' OR p.brand ILIKE '%' || $1 || '%')",
    "($2::int IS NULL OR p.category_id = $2)",
    `CASE $3 WHEN 'active' THEN p.active WHEN 'inactive' THEN NOT p.active
             WHEN 'low' THEN p.stock BETWEEN 1 AND 3 WHEN 'out' THEN p.stock = 0
             WHEN 'featured' THEN p.is_featured ELSE TRUE END`,
  ].join(" AND ");
  const params = [f.q, f.category_id, f.status];
  const [items, total] = await Promise.all([
    db.query(
      `SELECT p.id, p.slug, p.name, p.sku, p.brand, p.price, p.old_price, p.stock, p.images[1:1] AS images,
              p.active, p.is_featured, p.badge, p.sold_count, p.rating_avg, p.updated_at, c.name AS category_name
         FROM products p JOIN categories c ON c.id = p.category_id
        WHERE ${where} ORDER BY p.updated_at DESC, p.id DESC LIMIT $4 OFFSET $5`,
      [...params, f.limit, f.offset],
    ),
    db.query(`SELECT COUNT(*) AS n FROM products p WHERE ${where}`, params),
  ]);
  return { items: items.rows, total: total.rows[0].n as number };
}

export async function counts(db: Db) {
  const { rows } = await db.query(
    `SELECT COUNT(*) AS all, COUNT(*) FILTER (WHERE active) AS active, COUNT(*) FILTER (WHERE NOT active) AS inactive,
            COUNT(*) FILTER (WHERE stock BETWEEN 1 AND 3) AS low, COUNT(*) FILTER (WHERE stock = 0) AS out,
            COUNT(*) FILTER (WHERE is_featured) AS featured
       FROM products`,
  );
  return rows[0];
}

export async function byId(db: Db, id: number) {
  const { rows } = await db.query("SELECT * FROM products WHERE id = $1", [id]);
  return rows[0] ?? null;
}

const FIELDS = [
  "category_id", "name", "name_ky", "slug", "sku", "brand", "short_description", "short_description_ky", "description",
  "description_ky", "price", "old_price", "stock", "images", "specs", "specs_ky", "warranty_months", "badge", "badge_ky",
  "is_featured", "active",
] as const;

const values = (p: ProductInput) =>
  FIELDS.map((f) => (f === "specs" || f === "specs_ky" ? JSON.stringify(p[f]) : p[f]));

export async function insert(db: Db, p: ProductInput) {
  const { rows } = await db.query(
    `INSERT INTO products (${FIELDS.join(", ")}) VALUES (${FIELDS.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING *`,
    values(p),
  );
  return rows[0];
}

export async function update(db: Db, id: number, p: ProductInput) {
  const set = FIELDS.map((f, i) => `${f} = $${i + 2}`).join(", ");
  const { rows } = await db.query(`UPDATE products SET ${set}, updated_at = now() WHERE id = $1 RETURNING *`, [
    id,
    ...values(p),
  ]);
  return rows[0] ?? null;
}

export async function remove(db: Db, id: number) {
  const { rowCount } = await db.query("DELETE FROM products WHERE id = $1", [id]);
  return rowCount === 1;
}
