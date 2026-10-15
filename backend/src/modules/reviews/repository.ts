import type { Db } from "../../core/db.js";

export async function forProduct(db: Db, productId: number) {
  const [items, breakdown] = await Promise.all([
    db.query(
      `SELECT id, author, rating, text, created_at FROM reviews
        WHERE product_id = $1 AND status = 'approved' ORDER BY created_at DESC LIMIT 20`,
      [productId],
    ),
    db.query(
      `SELECT rating, COUNT(*) AS count FROM reviews WHERE product_id = $1 AND status = 'approved' GROUP BY rating`,
      [productId],
    ),
  ]);
  const map: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of breakdown.rows) map[r.rating] = r.count;
  return { items: items.rows, breakdown: map };
}

export async function insert(db: Db, r: { product_id: number; author: string; rating: number; text: string }) {
  const { rows } = await db.query(
    `INSERT INTO reviews (product_id, author, rating, text) VALUES ($1, $2, $3, $4) RETURNING id, status`,
    [r.product_id, r.author, r.rating, r.text],
  );
  return rows[0];
}

export async function list(db: Db, f: { q: string; status: string; limit: number; offset: number }) {
  const where = `($1 = '' OR r.status = $1) AND ($2 = '' OR r.author ILIKE '%' || $2 || '%' OR p.name ILIKE '%' || $2 || '%')`;
  const [items, total, counts] = await Promise.all([
    db.query(
      `SELECT r.*, p.name AS product_name, p.slug AS product_slug
         FROM reviews r JOIN products p ON p.id = r.product_id
        WHERE ${where} ORDER BY r.created_at DESC LIMIT $3 OFFSET $4`,
      [f.status, f.q, f.limit, f.offset],
    ),
    db.query(`SELECT COUNT(*) AS n FROM reviews r JOIN products p ON p.id = r.product_id WHERE ${where}`, [f.status, f.q]),
    db.query(`SELECT status, COUNT(*) AS n FROM reviews GROUP BY status`),
  ]);
  return {
    items: items.rows,
    total: total.rows[0].n as number,
    counts: Object.fromEntries(counts.rows.map((r) => [r.status, r.n])),
  };
}

export async function lock(db: Db, id: number) {
  const { rows } = await db.query("SELECT * FROM reviews WHERE id = $1 FOR UPDATE", [id]);
  return rows[0] ?? null;
}

export async function setStatus(db: Db, id: number, status: string) {
  const { rows } = await db.query("UPDATE reviews SET status = $2 WHERE id = $1 RETURNING *", [id, status]);
  return rows[0];
}

export async function remove(db: Db, id: number) {
  await db.query("DELETE FROM reviews WHERE id = $1", [id]);
}

/** Product rating = average of approved reviews only. */
export async function recalcRating(db: Db, productId: number) {
  await db.query(
    `UPDATE products p SET
        rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE product_id = p.id AND status = 'approved'), 0),
        rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND status = 'approved')
      WHERE p.id = $1`,
    [productId],
  );
}
