import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { DEFAULT_STORE, putStore } from "../modules/settings/repository.js";
import { config } from "./config.js";
import { pool, tx } from "./db.js";
import { BANNERS, CATEGORIES, CUSTOMERS, PRODUCTS, REVIEWS } from "./seed-data.js";
import { slugify } from "./text.js";

const STAFF = [
  { username: "manager", full_name: "Malika Menejer", phone: "+998901000001", role: "manager" },
  { username: "courier1", full_name: "Bekzod Kuryer", phone: "+998901000002", role: "courier" },
  { username: "courier2", full_name: "Rustam Kuryer", phone: "+998901000003", role: "courier" },
];

function seedImages(img: string): string[] {
  const dir = path.join(config.uploadDir, "seed", img);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".webp"))
    .sort()
    .map((f) => `/uploads/seed/${img}/${f}`);
}

/** Small deterministic PRNG so demo data is stable between fresh boots. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export async function seed() {
  const admin = await pool.query("SELECT 1 FROM users WHERE username = $1", [config.adminUsername]);
  if (admin.rowCount === 0) {
    await pool.query(
      "INSERT INTO users (username, password_hash, full_name, role) VALUES ($1, $2, 'Administrator', 'admin')",
      [config.adminUsername, await bcrypt.hash(config.adminPassword, 10)],
    );
    console.log(`seed: admin user "${config.adminUsername}" created`);
  }
  if (!config.seedDemo) return;
  const { rows } = await pool.query("SELECT COUNT(*) AS n FROM categories");
  if (rows[0].n > 0) return;

  await tx(async (db) => {
    await putStore(db, DEFAULT_STORE);
    const demoHash = await bcrypt.hash("demo123", 10);
    const staffIds: number[] = [];
    for (const s of STAFF) {
      const r = await db.query(
        `INSERT INTO users (username, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name RETURNING id`,
        [s.username, demoHash, s.full_name, s.phone, s.role],
      );
      staffIds.push(r.rows[0].id);
    }

    const catIds = new Map<string, number>();
    for (const c of CATEGORIES) {
      const r = await db.query(
        "INSERT INTO categories (name, slug, icon, sort, active) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [c.name, c.slug, c.icon, c.sort, c.active],
      );
      catIds.set(c.slug, r.rows[0].id);
    }

    const products: { id: number; price: number; name: string; image: string | null }[] = [];
    let n = 0;
    for (const p of PRODUCTS) {
      n += 1;
      const images = seedImages(p.img);
      const description = `${p.short}\n\n${p.name} — Mir do'konidan rasmiy kafolat bilan. Buyurtmangizni o'z kuryerlarimiz yetkazib beradi, to'lovni qabul qilganda naqd yoki karta orqali amalga oshirasiz.\n\nTo'plamda: qurilma, hujjatlar va kafolat taloni.`;
      const r = await db.query(
        `INSERT INTO products (category_id, name, slug, sku, brand, short_description, description, price, old_price, stock,
                               images, specs, warranty_months, badge, is_featured, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, now() - ($16 || ' days')::interval)
         RETURNING id`,
        [
          catIds.get(p.cat), p.name, slugify(p.name), `MIR-${String(n).padStart(4, "0")}`, p.brand, p.short, description,
          p.price, p.old ?? null, p.stock, images,
          JSON.stringify([...p.specs.map(([label, value]) => ({ label, value })), { label: "Kafolat", value: `${p.warranty ?? 12} oy` }]),
          p.warranty ?? 12, p.badge ?? null, p.featured ?? false, String(PRODUCTS.length - n),
        ],
      );
      products.push({ id: r.rows[0].id, price: p.price, name: p.name, image: images[0] ?? null });
    }

    for (const b of BANNERS) {
      await db.query(
        `INSERT INTO banners (title, subtitle, image, link, cta, theme, placement, sort) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [b.title, b.subtitle, b.image, b.link, b.cta, b.theme, b.placement, b.sort],
      );
    }

    const rand = rng(42);
    for (const p of products) {
      const count = Math.floor(rand() * 4);
      for (let i = 0; i < count; i++) {
        const [author, rating, text] = REVIEWS[Math.floor(rand() * REVIEWS.length)];
        await db.query(
          `INSERT INTO reviews (product_id, author, rating, text, status, created_at)
           VALUES ($1, $2, $3, $4, 'approved', now() - ($5 || ' days')::interval)`,
          [p.id, author, rating, text, String(Math.floor(rand() * 40))],
        );
      }
    }
    await db.query(
      `INSERT INTO reviews (product_id, author, rating, text) VALUES ($1, 'Kamola', 5, 'Ajoyib telefon, kamerasi zo''r!')`,
      [products[0].id],
    );
    await db.query(`
      UPDATE products p SET
        rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE product_id = p.id AND status = 'approved'), 0),
        rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND status = 'approved')`);

    const statuses = ["delivered", "delivered", "delivered", "delivering", "confirmed", "new", "cancelled"];
    for (let i = 0; i < 26; i++) {
      const [name, phone, region] = CUSTOMERS[i % CUSTOMERS.length];
      const status = i < 3 ? "new" : statuses[Math.floor(rand() * statuses.length)];
      const daysAgo = i < 3 ? 0 : Math.floor(rand() * 14);
      const lines = Array.from({ length: 1 + Math.floor(rand() * 2) }, () => products[Math.floor(rand() * products.length)]);
      const unique = [...new Map(lines.map((l) => [l.id, l])).values()];
      const subtotal = unique.reduce((s, l) => s + l.price, 0);
      const fee = subtotal < DEFAULT_STORE.free_delivery_from ? DEFAULT_STORE.delivery_fee : 0;
      const assignee = ["delivering", "delivered", "confirmed"].includes(status) ? staffIds[1 + (i % 2)] : null;
      const o = await db.query(
        `INSERT INTO orders (customer_name, phone, region, address, delivery_method, payment_method, status, subtotal,
                             delivery_fee, total, assignee_id, created_at, updated_at)
         VALUES ($1, $2, $3, 'Mustaqillik ko''chasi, 12-uy', 'courier', $4, $5, $6, $7, $8, $9,
                 now() - ($10 || ' days')::interval - ($11 || ' hours')::interval, now() - ($10 || ' days')::interval)
         RETURNING id`,
        [name, phone, region, i % 3 === 0 ? "card" : "cash", status, subtotal, fee, subtotal + fee, assignee,
          String(daysAgo), String(Math.floor(rand() * 8))],
      );
      for (const l of unique) {
        await db.query(
          `INSERT INTO order_items (order_id, product_id, name, image, price, qty, line_total) VALUES ($1, $2, $3, $4, $5, 1, $5)`,
          [o.rows[0].id, l.id, l.name, l.image, l.price],
        );
        if (status === "delivered") await db.query("UPDATE products SET sold_count = sold_count + 1 WHERE id = $1", [l.id]);
      }
      await db.query(
        `INSERT INTO order_events (order_id, status, note, created_at)
         SELECT id, 'new', 'Buyurtma saytdan qabul qilindi', created_at FROM orders WHERE id = $1`,
        [o.rows[0].id],
      );
      if (status !== "new") {
        await db.query("INSERT INTO order_events (order_id, status, note, created_at) SELECT id, status, '', updated_at FROM orders WHERE id = $1", [o.rows[0].id]);
      }
    }
  });
  console.log("seed: demo catalog, banners, staff and orders created");
}
