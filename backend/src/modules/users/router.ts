import { Router } from "express";
import { z } from "zod";
import { allow } from "../../core/auth.js";
import { pool } from "../../core/db.js";
import { idParam, parse, zmsg } from "../../core/http.js";
import { normalizePhone } from "../../core/text.js";
import * as repo from "./repository.js";
import * as service from "./service.js";

export const usersRouter = Router();

const role = z.enum(["admin", "manager", "courier"]);
const phone = z
  .string()
  .trim()
  .max(20)
  .optional()
  .transform((v) => (v ? normalizePhone(v) : null));
const password = z.string().min(8, zmsg("Минимум 8 символов", "Кеминде 8 белги")).max(200);

const createSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9._-]+$/i, zmsg("Только латинские буквы, цифры, . _ -", "Латын тамгалары, сандар, . _ - гана")),
  password,
  full_name: z.string().trim().min(2).max(120),
  phone,
  role,
});

const updateSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone,
  role,
  active: z.boolean(),
});

usersRouter.get("/", allow("manager"), async (req, res) => {
  const r = z.object({ role: z.string().max(20).optional().default("") }).parse(req.query);
  res.json(await repo.list(pool, r.role));
});

usersRouter.post("/", allow(), async (req, res) => {
  res.status(201).json(await service.create(parse(createSchema, req.body)));
});

usersRouter.patch("/:id", allow(), async (req, res) => {
  res.json(await service.update(idParam(req), req.user!.id, parse(updateSchema, req.body)));
});

usersRouter.post("/:id/password", allow(), async (req, res) => {
  const body = parse(z.object({ password }), req.body);
  await service.resetPassword(idParam(req), body.password);
  res.status(204).end();
});
