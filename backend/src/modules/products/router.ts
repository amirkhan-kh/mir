import { Router } from "express";
import { z } from "zod";
import { allow } from "../../core/auth.js";
import { pool } from "../../core/db.js";
import { idParam, notFound, pageOf, parse } from "../../core/http.js";
import { slugify } from "../../core/text.js";
import * as reviews from "../reviews/repository.js";
import { imageUrl } from "../uploads/router.js";
import * as repo from "./repository.js";

export const productsPublic = Router();
export const productsRouter = Router();

const csv = (max: number) =>
  z
    .string()
    .max(1000)
    .optional()
    .transform((v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean).slice(0, max) : []));
const flag = z
  .string()
  .optional()
  .transform((v) => v === "1" || v === "true");
const price = z.coerce.number().min(0).max(1e12).optional().transform((v) => v ?? null);

const publicQuery = z.object({
  q: z.string().trim().max(120).optional().default(""),
  category: z.string().trim().max(80).optional().default(""),
  brand: csv(20),
  min: price,
  max: price,
  sort: z.enum(Object.keys(repo.SORTS) as [keyof typeof repo.SORTS]).catch("popular"),
  discount: flag,
  featured: flag,
  in_stock: flag,
  ids: csv(60).transform((a) => a.map(Number).filter((n) => Number.isInteger(n) && n > 0)),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

productsPublic.get("/", async (req, res) => {
  const f = parse(publicQuery, req.query);
  const filter = {
    q: f.q, category: f.category, brands: f.brand, min: f.min, max: f.max, sort: f.sort,
    discount: f.discount, featured: f.featured, inStock: f.in_stock, ids: f.ids,
    limit: f.limit, offset: (f.page - 1) * f.limit,
  };
  const [list, facets] = await Promise.all([repo.listPublic(pool, filter), repo.facets(pool, filter)]);
  res.json({ ...list, page: f.page, limit: f.limit, facets });
});

productsPublic.get("/:slug", async (req, res) => {
  const product = await repo.bySlug(pool, String(req.params.slug));
  if (!product) throw notFound("Tovar topilmadi");
  const [related, review] = await Promise.all([
    repo.related(pool, product.category_id, product.id),
    reviews.forProduct(pool, product.id),
  ]);
  res.json({ ...product, related, reviews: review.items, rating_breakdown: review.breakdown });
});

const spec = z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(200) });
const money = z.coerce.number().min(0).max(1e12);

const productSchema = z
  .object({
    category_id: z.coerce.number().int().positive(),
    name: z.string().trim().min(2).max(160),
    slug: z.string().trim().max(80).optional().default(""),
    sku: z.string().trim().max(60).nullable().optional().transform((v) => v || null),
    brand: z.string().trim().max(60).nullable().optional().transform((v) => v || null),
    short_description: z.string().trim().max(300).default(""),
    description: z.string().trim().max(10_000).default(""),
    price: money,
    old_price: money.nullable().optional().transform((v) => (v ? v : null)),
    stock: z.coerce.number().int().min(0).max(1_000_000),
    images: z.array(imageUrl).max(10).default([]),
    specs: z.array(spec).max(40).default([]),
    warranty_months: z.coerce.number().int().min(0).max(120).default(12),
    badge: z.string().trim().max(20).nullable().optional().transform((v) => v || null),
    is_featured: z.boolean().default(false),
    active: z.boolean().default(true),
  })
  .refine((p) => p.old_price === null || p.old_price > p.price, {
    path: ["old_price"],
    message: "Eski narx joriy narxdan katta bo'lishi kerak",
  })
  .transform((p) => ({ ...p, slug: slugify(p.slug || p.name) }));

const adminQuery = z.object({
  category_id: z.coerce.number().int().positive().optional().transform((v) => v ?? null),
});

productsRouter.get("/", async (req, res) => {
  const page = pageOf(req);
  const { category_id } = parse(adminQuery, req.query);
  const [list, counts] = await Promise.all([
    repo.listAdmin(pool, { q: page.q, status: page.status, category_id, limit: page.limit, offset: page.offset }),
    repo.counts(pool),
  ]);
  res.json({ ...list, page: page.page, limit: page.limit, counts });
});

productsRouter.get("/:id", async (req, res) => {
  const row = await repo.byId(pool, idParam(req));
  if (!row) throw notFound("Tovar topilmadi");
  res.json(row);
});

productsRouter.post("/", allow("manager"), async (req, res) => {
  res.status(201).json(await repo.insert(pool, parse(productSchema, req.body)));
});

productsRouter.patch("/:id", allow("manager"), async (req, res) => {
  const row = await repo.update(pool, idParam(req), parse(productSchema, req.body));
  if (!row) throw notFound("Tovar topilmadi");
  res.json(row);
});

productsRouter.delete("/:id", allow("manager"), async (req, res) => {
  if (!(await repo.remove(pool, idParam(req)))) throw notFound("Tovar topilmadi");
  res.status(204).end();
});
