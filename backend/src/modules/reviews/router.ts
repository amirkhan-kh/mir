import { Router } from "express";
import { z } from "zod";
import { allow } from "../../core/auth.js";
import { pool } from "../../core/db.js";
import { idParam, notFound, pageOf, parse } from "../../core/http.js";
import { msg } from "../../core/i18n.js";
import { rateLimit } from "../../core/rate-limit.js";
import * as products from "../products/repository.js";
import * as repo from "./repository.js";
import * as service from "./service.js";

export const reviewsPublic = Router();
export const reviewsRouter = Router();

const createSchema = z.object({
  product_id: z.coerce.number().int().positive(),
  author: z.string().trim().min(2).max(60),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().max(1000).default(""),
});

reviewsPublic.post("/", rateLimit("review", 5, 10 * 60_000), async (req, res) => {
  const input = parse(createSchema, req.body);
  const product = await products.byId(pool, input.product_id);
  if (!product || !product.active) throw notFound(msg("Товар не найден", "Товар табылган жок"));
  res.status(201).json(await repo.insert(pool, input));
});

reviewsRouter.get("/", async (req, res) => {
  const p = pageOf(req);
  res.json({ ...(await repo.list(pool, p)), page: p.page, limit: p.limit });
});

reviewsRouter.patch("/:id", allow("manager"), async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(["approved", "rejected", "pending"]) }), req.body);
  res.json(await service.moderate(idParam(req), status));
});

reviewsRouter.delete("/:id", allow("manager"), async (req, res) => {
  await service.remove(idParam(req));
  res.status(204).end();
});
