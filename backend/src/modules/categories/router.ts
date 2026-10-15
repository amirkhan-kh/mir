import { Router } from "express";
import { z } from "zod";
import { allow } from "../../core/auth.js";
import { pool } from "../../core/db.js";
import { idParam, notFound, parse } from "../../core/http.js";
import { langOf, msg } from "../../core/i18n.js";
import { slugify } from "../../core/text.js";
import { imageUrl } from "../uploads/router.js";
import * as repo from "./repository.js";

export const categoriesPublic = Router();
export const categoriesRouter = Router();

const NOT_FOUND = msg("Категория не найдена", "Категория табылган жок");

categoriesPublic.get("/", async (req, res) => {
  res.set("Cache-Control", "public, max-age=30");
  res.json(await repo.listPublic(pool, langOf(req)));
});

categoriesPublic.get("/:slug", async (req, res) => {
  const row = await repo.bySlug(pool, String(req.params.slug), langOf(req));
  if (!row) throw notFound(NOT_FOUND);
  res.json(row);
});

const schema = z
  .object({
    name: z.string().trim().min(2).max(80),
    name_ky: z.string().trim().max(80).default(""),
    slug: z.string().trim().max(80).optional().default(""),
    icon: z.string().trim().min(1).max(40).default("package"),
    image: imageUrl.nullable().optional().default(null),
    sort: z.coerce.number().int().min(0).max(10_000).default(0),
    active: z.boolean().default(true),
  })
  .transform((c) => ({ ...c, slug: slugify(c.slug || c.name) }));

categoriesRouter.get("/", async (_req, res) => {
  res.json(await repo.listAll(pool));
});

categoriesRouter.post("/", allow("manager"), async (req, res) => {
  res.status(201).json(await repo.insert(pool, parse(schema, req.body)));
});

categoriesRouter.patch("/:id", allow("manager"), async (req, res) => {
  const row = await repo.update(pool, idParam(req), parse(schema, req.body));
  if (!row) throw notFound(NOT_FOUND);
  res.json(row);
});

categoriesRouter.delete("/:id", allow("manager"), async (req, res) => {
  if (!(await repo.remove(pool, idParam(req)))) throw notFound(NOT_FOUND);
  res.status(204).end();
});
