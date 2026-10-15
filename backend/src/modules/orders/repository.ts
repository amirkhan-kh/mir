import type { Db } from "../../core/db.js";
import { col, type Lang } from "../../core/i18n.js";

export interface OrderRow {
  idempotency_key: string | null;
  customer_name: string;
  phone: string;
  region: string;
  address: string;
  comment: string;
  delivery_method: "courier" | "pickup";
  payment_method: "cash" | "card" | "installment";
  installment_months: number | null;
  installment_monthly: number | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
}

export interface ItemRow {
  product_id: number;
  name: string;
  image: string | null;
  price: number;
  qty: number;
  line_total: number;
}

export async function lockProducts(db: Db, ids: number[]) {
  const { rows } = await db.query(
    `SELECT p.id, p.name, p.slug, p.price, p.old_price, p.stock, p.images[1] AS image, p.active AND c.active AS available
       FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.id = ANY($1) ORDER BY p.id FOR UPDATE OF p`,
    [ids],
  );
  return rows;
}

export async function readProducts(db: Db, ids: number[], lang: Lang) {
  const { rows } = await db.query(
    `SELECT p.id, ${col(lang, "p.name")}, p.slug, p.price, p.old_price, p.stock, p.images[1] AS image, p.active AND c.active AS available
       FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ANY($1)`,
    [ids],
  );
  return rows;
}

const ORDER_FIELDS = [
  "idempotency_key", "customer_name", "phone", "region", "address", "comment", "delivery_method",
  "payment_method", "installment_months", "installment_monthly", "subtotal", "delivery_fee", "total",
] as const;

/** Returns null when an order with the same idempotency key already exists. */
export async function insertOrder(db: Db, o: OrderRow) {
  const { rows } = await db.query(
    `INSERT INTO orders (${ORDER_FIELDS.join(", ")})
     VALUES (${ORDER_FIELDS.map((_, i) => `$${i + 1}`).join(", ")})
     ON CONFLICT (idempotency_key) DO NOTHING RETURNING *`,
    ORDER_FIELDS.map((f) => o[f]),
  );
  return rows[0] ?? null;
}

export async function byIdempotencyKey(db: Db, key: string) {
  const { rows } = await db.query("SELECT * FROM orders WHERE idempotency_key = $1", [key]);
  return rows[0] ?? null;
}

export async function insertItems(db: Db, orderId: number, items: ItemRow[]) {
  for (const i of items) {
    await db.query(
      `INSERT INTO order_items (order_id, product_id, name, image, price, qty, line_total)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [orderId, i.product_id, i.name, i.image, i.price, i.qty, i.line_total],
    );
  }
}

export async function changeStock(db: Db, productId: number, delta: number) {
  await db.query("UPDATE products SET stock = stock + $2, updated_at = now() WHERE id = $1", [productId, delta]);
}

export async function addSold(db: Db, productId: number, qty: number) {
  await db.query("UPDATE products SET sold_count = sold_count + $2 WHERE id = $1", [productId, qty]);
}

export async function addEvent(db: Db, orderId: number, status: string, note: string, userId: number | null) {
  await db.query("INSERT INTO order_events (order_id, status, note, user_id) VALUES ($1, $2, $3, $4)", [
    orderId, status, note, userId,
  ]);
}

export async function lock(db: Db, id: number) {
  const { rows } = await db.query("SELECT * FROM orders WHERE id = $1 FOR UPDATE", [id]);
  return rows[0] ?? null;
}

export async function setStatus(db: Db, id: number, status: string) {
  const { rows } = await db.query("UPDATE orders SET status = $2, updated_at = now() WHERE id = $1 RETURNING *", [
    id, status,
  ]);
  return rows[0];
}

export async function setAssignee(db: Db, id: number, assigneeId: number | null) {
  await db.query("UPDATE orders SET assignee_id = $2, updated_at = now() WHERE id = $1", [id, assigneeId]);
}

export async function setNote(db: Db, id: number, note: string) {
  await db.query("UPDATE orders SET staff_note = $2, updated_at = now() WHERE id = $1", [id, note]);
}

export async function items(db: Db, orderId: number) {
  const { rows } = await db.query(
    `SELECT i.*, p.slug, p.stock FROM order_items i LEFT JOIN products p ON p.id = i.product_id
      WHERE i.order_id = $1 ORDER BY i.id`,
    [orderId],
  );
  return rows;
}

export async function events(db: Db, orderId: number) {
  const { rows } = await db.query(
    `SELECT e.id, e.status, e.note, e.created_at, u.full_name AS user_name
       FROM order_events e LEFT JOIN users u ON u.id = e.user_id
      WHERE e.order_id = $1 ORDER BY e.created_at, e.id`,
    [orderId],
  );
  return rows;
}

export async function byId(db: Db, id: number) {
  const { rows } = await db.query(
    `SELECT o.*, u.full_name AS assignee_name, u.phone AS assignee_phone
       FROM orders o LEFT JOIN users u ON u.id = o.assignee_id WHERE o.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function byNumber(db: Db, number: string) {
  const { rows } = await db.query("SELECT * FROM orders WHERE upper(number) = upper($1)", [number]);
  return rows[0] ?? null;
}

export async function list(
  db: Db,
  f: { q: string; status: string; assigneeId: number | null; limit: number; offset: number },
) {
  const where = `($1 = '' OR o.number ILIKE '%' || $1 || '%' OR o.customer_name ILIKE '%' || $1 || '%'
                   OR (length(regexp_replace($1, '\\D', '', 'g')) >= 3
                       AND o.phone LIKE '%' || regexp_replace($1, '\\D', '', 'g') || '%'))
             AND ($2 = '' OR o.status = $2)
             AND ($3::int IS NULL OR o.assignee_id = $3)`;
  const scope = `($1::int IS NULL OR assignee_id = $1)`;
  const [items, total, counts] = await Promise.all([
    db.query(
      `SELECT o.id, o.number, o.customer_name, o.phone, o.region, o.delivery_method, o.payment_method, o.status,
              o.total, o.created_at, u.full_name AS assignee_name,
              (SELECT COALESCE(SUM(qty), 0) FROM order_items WHERE order_id = o.id) AS items_count
         FROM orders o LEFT JOIN users u ON u.id = o.assignee_id
        WHERE ${where} ORDER BY o.created_at DESC, o.id DESC LIMIT $4 OFFSET $5`,
      [f.q, f.status, f.assigneeId, f.limit, f.offset],
    ),
    db.query(`SELECT COUNT(*) AS n FROM orders o WHERE ${where}`, [f.q, f.status, f.assigneeId]),
    db.query(`SELECT status, COUNT(*) AS n FROM orders WHERE ${scope} GROUP BY status`, [f.assigneeId]),
  ]);
  return {
    items: items.rows,
    total: total.rows[0].n as number,
    counts: Object.fromEntries(counts.rows.map((r) => [r.status, r.n])),
  };
}

export async function activeStaff(db: Db, id: number) {
  const { rows } = await db.query("SELECT id, full_name FROM users WHERE id = $1 AND active", [id]);
  return rows[0] ?? null;
}
