import type { Db } from "../../core/db.js";

export interface CategoryInput {
  name: string;
  slug: string;
  icon: string;
  image: string | null;
  sort: number;
  active: boolean;
}

const WITH_COUNT = `
  SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.active) AS product_count
    FROM categories c`;

export async function listPublic(db: Db) {
  const { rows } = await db.query(`${WITH_COUNT} WHERE c.active ORDER BY c.sort, c.name`);
  return rows;
}

export async function listAll(db: Db) {
  const { rows } = await db.query(`${WITH_COUNT} ORDER BY c.sort, c.name`);
  return rows;
}

export async function bySlug(db: Db, slug: string) {
  const { rows } = await db.query(`${WITH_COUNT} WHERE c.slug = $1 AND c.active`, [slug]);
  return rows[0] ?? null;
}

export async function insert(db: Db, c: CategoryInput) {
  const { rows } = await db.query(
    `INSERT INTO categories (name, slug, icon, image, sort, active)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [c.name, c.slug, c.icon, c.image, c.sort, c.active],
  );
  return rows[0];
}

export async function update(db: Db, id: number, c: CategoryInput) {
  const { rows } = await db.query(
    `UPDATE categories SET name = $2, slug = $3, icon = $4, image = $5, sort = $6, active = $7
      WHERE id = $1 RETURNING *`,
    [id, c.name, c.slug, c.icon, c.image, c.sort, c.active],
  );
  return rows[0] ?? null;
}

export async function remove(db: Db, id: number) {
  const { rowCount } = await db.query("DELETE FROM categories WHERE id = $1", [id]);
  return rowCount === 1;
}
