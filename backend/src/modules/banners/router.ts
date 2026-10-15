import { Router } from "express";
import { z } from "zod";
import { allow } from "../../core/auth.js";
import { pool } from "../../core/db.js";
import { idParam, notFound, parse, zmsg } from "../../core/http.js";
import { langOf, msg } from "../../core/i18n.js";
import { imageUrl } from "../uploads/router.js";
import * as repo from "./repository.js";

export const bannersPublic = Router();
export const bannersRouter = Router();

const NOT_FOUND = msg("Баннер не найден", "Баннер табылган жок");

bannersPublic.get("/", async (req, res) => {
  res.set("Cache-Control", "public, max-age=30");
  res.json(await repo.listPublic(pool, langOf(req)));
});

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => v || null);

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  title_ky: z.string().trim().max(120).default(""),
  subtitle: z.string().trim().max(240).default(""),
  subtitle_ky: z.string().trim().max(240).default(""),
  image: imageUrl.nullable().optional().default(null),
  link: optionalText(300).refine(
    (v) => !v || v.startsWith("/") || /^https:\/\//.test(v),
    zmsg("Ссылка начинается с / или https://", "Шилтеме / же https:// менен башталат"),
  ),
  cta: optionalText(40),
  cta_ky: z.string().trim().max(40).nullable().optional().transform((v) => v ?? ""),
  theme: z.enum(["dark", "light", "lime"]).default("dark"),
  placement: z.enum(["hero", "promo"]).default("hero"),
  sort: z.coerce.number().int().min(0).max(10_000).default(0),
  active: z.boolean().default(true),
});

bannersRouter.get("/", async (_req, res) => {
  res.json(await repo.listAll(pool));
});

bannersRouter.post("/", allow("manager"), async (req, res) => {
  res.status(201).json(await repo.insert(pool, parse(schema, req.body)));
});

bannersRouter.patch("/:id", allow("manager"), async (req, res) => {
  const row = await repo.update(pool, idParam(req), parse(schema, req.body));
  if (!row) throw notFound(NOT_FOUND);
  res.json(row);
});

bannersRouter.delete("/:id", allow("manager"), async (req, res) => {
  if (!(await repo.remove(pool, idParam(req)))) throw notFound(NOT_FOUND);
  res.status(204).end();
});
