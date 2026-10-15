import type { Db } from "../../core/db.js";
import { col, type Lang } from "../../core/i18n.js";

export interface CategoryInput {
  name: string;
  name_ky: string;
  slug: string;
  icon: string;
  image: string | null;
  sort: number;
  active: boolean;
}

const COUNT = "(SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.active) AS product_count";

const publicSelect = (lang: Lang) =>
  `SELECT c.id, ${col(lang, "c.name")}, c.slug, c.icon, c.image, c.sort, c.active, ${COUNT} FROM categories c`;

export async function listPublic(db: Db, lang: Lang) {
  const { rows } = await db.query(`${publicSelect(lang)} WHERE c.active ORDER BY c.sort, name`);
  return rows;
}

export async function listAll(db: Db) {
  const { rows } = await db.query(`SELECT c.*, ${COUNT} FROM categories c ORDER BY c.sort, c.name`);
  return rows;
}

export async function bySlug(db: Db, slug: string, lang: Lang) {
  const { rows } = await db.query(`${publicSelect(lang)} WHERE c.slug = $1 AND c.active`, [slug]);
  return rows[0] ?? null;
}

export async function insert(db: Db, c: CategoryInput) {
  const { rows } = await db.query(
    `INSERT INTO categories (name, name_ky, slug, icon, image, sort, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [c.name, c.name_ky, c.slug, c.icon, c.image, c.sort, c.active],
  );
  return rows[0];
}

export async function update(db: Db, id: number, c: CategoryInput) {
  const { rows } = await db.query(
    `UPDATE categories SET name = $2, name_ky = $3, slug = $4, icon = $5, image = $6, sort = $7, active = $8
      WHERE id = $1 RETURNING *`,
    [id, c.name, c.name_ky, c.slug, c.icon, c.image, c.sort, c.active],
  );
  return rows[0] ?? null;
}

export async function remove(db: Db, id: number) {
  const { rowCount } = await db.query("DELETE FROM categories WHERE id = $1", [id]);
  return rowCount === 1;
}
