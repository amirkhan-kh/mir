import type { Db } from "../../core/db.js";

export interface BannerInput {
  title: string;
  subtitle: string;
  image: string | null;
  link: string | null;
  cta: string | null;
  theme: "dark" | "light" | "lime";
  placement: "hero" | "promo";
  sort: number;
  active: boolean;
}

export async function listPublic(db: Db) {
  const { rows } = await db.query("SELECT * FROM banners WHERE active ORDER BY placement, sort, id");
  return rows;
}

export async function listAll(db: Db) {
  const { rows } = await db.query("SELECT * FROM banners ORDER BY placement, sort, id");
  return rows;
}

const FIELDS = ["title", "subtitle", "image", "link", "cta", "theme", "placement", "sort", "active"] as const;

export async function insert(db: Db, b: BannerInput) {
  const { rows } = await db.query(
    `INSERT INTO banners (${FIELDS.join(", ")}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    FIELDS.map((f) => b[f]),
  );
  return rows[0];
}

export async function update(db: Db, id: number, b: BannerInput) {
  const set = FIELDS.map((f, i) => `${f} = $${i + 2}`).join(", ");
  const { rows } = await db.query(`UPDATE banners SET ${set} WHERE id = $1 RETURNING *`, [
    id,
    ...FIELDS.map((f) => b[f]),
  ]);
  return rows[0] ?? null;
}

export async function remove(db: Db, id: number) {
  const { rowCount } = await db.query("DELETE FROM banners WHERE id = $1", [id]);
  return rowCount === 1;
}
