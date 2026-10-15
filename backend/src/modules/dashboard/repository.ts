import type { Db } from "../../core/db.js";

export async function summary(db: Db) {
  const [kpi, daily, top, low, recent, byStatus] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now())) AS orders_today,
        COUNT(*) FILTER (WHERE status = 'new') AS orders_new,
        COUNT(*) FILTER (WHERE status IN ('confirmed', 'delivering')) AS orders_in_progress,
        COALESCE(SUM(total) FILTER (WHERE status = 'delivered' AND updated_at >= date_trunc('month', now())), 0) AS revenue_month,
        COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled' AND created_at >= now() - interval '30 days'), 0) AS sales_30d,
        COUNT(*) FILTER (WHERE status <> 'cancelled' AND created_at >= now() - interval '30 days') AS orders_30d
      FROM orders`),
    db.query(`
      SELECT to_char(d, 'YYYY-MM-DD') AS day,
             COALESCE(SUM(o.total) FILTER (WHERE o.status <> 'cancelled'), 0) AS sales,
             COUNT(o.id) FILTER (WHERE o.status <> 'cancelled') AS orders
        FROM generate_series(date_trunc('day', now()) - interval '13 days', date_trunc('day', now()), interval '1 day') d
        LEFT JOIN orders o ON date_trunc('day', o.created_at) = d
       GROUP BY d ORDER BY d`),
    db.query(`
      SELECT i.product_id, i.name, SUM(i.qty) AS qty, SUM(i.line_total) AS revenue
        FROM order_items i JOIN orders o ON o.id = i.order_id
       WHERE o.status <> 'cancelled' AND o.created_at >= now() - interval '30 days'
       GROUP BY i.product_id, i.name ORDER BY qty DESC LIMIT 5`),
    db.query(`SELECT id, name, stock, images[1] AS image FROM products WHERE active AND stock <= 3 ORDER BY stock, name LIMIT 8`),
    db.query(`SELECT id, number, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 6`),
    db.query(`SELECT status, COUNT(*) AS n FROM orders GROUP BY status`),
  ]);
  const catalog = await db.query(`
    SELECT COUNT(*) FILTER (WHERE active) AS products_active,
           (SELECT COUNT(*) FROM reviews WHERE status = 'pending') AS reviews_pending
      FROM products`);
  return {
    kpi: { ...kpi.rows[0], ...catalog.rows[0] },
    daily: daily.rows,
    top: top.rows,
    low_stock: low.rows,
    recent: recent.rows,
    by_status: Object.fromEntries(byStatus.rows.map((r) => [r.status, r.n])),
  };
}
