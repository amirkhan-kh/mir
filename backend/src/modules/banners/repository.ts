import type { Db } from "../../core/db.js";
import { col, type Lang } from "../../core/i18n.js";

export interface BannerInput {
  title: string;
  title_ky: string;
  subtitle: string;
  subtitle_ky: string;
  image: string | null;
  link: string | null;
  cta: string | null;
  cta_ky: string;
  theme: "dark" | "light" | "lime";
  placement: "hero" | "promo";
  sort: number;
  active: boolean;
}

export async function listPublic(db: Db, lang: Lang) {
  const { rows } = await db.query(
    `SELECT id, ${col(lang, "title")}, ${col(lang, "subtitle")}, image, link, ${col(lang, "cta")}, theme, placement, sort, active
       FROM banners WHERE active ORDER BY placement, sort, id`,
  );
  return rows;
}

export async function listAll(db: Db) {
  const { rows } = await db.query("SELECT * FROM banners ORDER BY placement, sort, id");
  return rows;
}

const FIELDS = [
  "title", "title_ky", "subtitle", "subtitle_ky", "image", "link", "cta", "cta_ky", "theme", "placement", "sort", "active",
] as const;

export async function insert(db: Db, b: BannerInput) {
  const { rows } = await db.query(
    `INSERT INTO banners (${FIELDS.join(", ")}) VALUES (${FIELDS.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING *`,
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
