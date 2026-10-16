import { Router } from "express";
import { z } from "zod";
import { allow } from "../../core/auth.js";
import { config } from "../../core/config.js";
import { pool } from "../../core/db.js";
import { langOf } from "../../core/i18n.js";
import { idParam, pageOf, parse, zmsg } from "../../core/http.js";
import { rateLimit } from "../../core/rate-limit.js";
import { normalizePhone } from "../../core/text.js";
import * as repo from "./repository.js";
import * as service from "./service.js";

export const ordersPublic = Router();
export const ordersRouter = Router();

const lines = z
  .array(z.object({ product_id: z.coerce.number().int().positive(), qty: z.coerce.number().int().min(1).max(99) }))
  .min(1, zmsg("Корзина пуста", "Себет бош"))
  .max(50);

const checkoutSchema = z
  .object({
    idempotency_key: z.string().trim().min(8).max(64).nullable().optional().transform((v) => v ?? null),
    customer_name: z.string().trim().min(2, zmsg("Введите имя", "Атыңызды жазыңыз")).max(80),
    phone: z.string().trim().max(20).transform((v, ctx) => {
      const p = normalizePhone(v);
      if (!p) ctx.addIssue({ code: "custom", message: zmsg("Неверный номер телефона (+996 XXX XXX XXX)", "Телефон номери туура эмес (+996 XXX XXX XXX)") });
      return p ?? "";
    }),
    region: z.string().trim().min(2).max(60),
    address: z.string().trim().max(240).default(""),
    comment: z.string().trim().max(500).default(""),
    delivery_method: z.enum(["courier", "pickup"]),
    payment_method: z.enum(["cash", "card", "installment"]),
    installment_months: z.coerce.number().int().min(1).max(60).nullable().optional().transform((v) => v ?? null),
    items: lines,
  })
  .refine((o) => o.delivery_method === "pickup" || o.address.length >= 5, {
    path: ["address"],
    message: zmsg("Укажите полный адрес доставки", "Жеткирүү дарегин толук жазыңыз"),
  })
  .refine((o) => o.payment_method !== "installment" || o.installment_months !== null, {
    path: ["installment_months"],
    message: zmsg("Выберите срок", "Мөөнөттү тандаңыз"),
  });

ordersPublic.post("/quote", async (req, res) => {
  const body = parse(z.object({ items: z.array(z.object({ product_id: z.coerce.number().int().positive(), qty: z.coerce.number().int().min(1).max(99) })).max(50) }), req.body);
  res.json(await service.quote(body.items, langOf(req)));
});

ordersPublic.post("/", rateLimit("checkout", config.checkoutRateMax, 10 * 60_000), async (req, res) => {
  const order = await service.create(parse(checkoutSchema, req.body));
  res.status(201).json({ number: order.number, total: order.total, status: order.status, phone: order.phone });
});

ordersPublic.get("/:number", rateLimit("track", 30, 10 * 60_000), async (req, res) => {
  const { phone } = parse(z.object({ phone: z.string().trim().min(9).max(20) }), req.query);
  res.json(await service.track(String(req.params.number).slice(0, 20), phone));
});

ordersRouter.get("/", async (req, res) => {
  const p = pageOf(req);
  const assigneeId = req.user!.role === "courier" ? req.user!.id : null;
  res.json({ ...(await repo.list(pool, { ...p, assigneeId })), page: p.page, limit: p.limit });
});

ordersRouter.get("/:id", async (req, res) => {
  res.json(await service.detail(idParam(req), req.user!));
});

const statusSchema = z.object({
  status: z.enum(["confirmed", "delivering", "delivered", "cancelled"]),
  note: z.string().trim().max(300).default(""),
});

ordersRouter.patch("/:id/status", allow("manager", "courier"), async (req, res) => {
  const body = parse(statusSchema, req.body);
  res.json(await service.changeStatus(idParam(req), body.status, body.note, req.user!));
});

ordersRouter.patch("/:id/assign", allow("manager"), async (req, res) => {
  const body = parse(z.object({ assignee_id: z.coerce.number().int().positive().nullable() }), req.body);
  await service.assign(idParam(req), body.assignee_id, req.user!);
  res.status(204).end();
});

ordersRouter.patch("/:id/note", allow("manager"), async (req, res) => {
  const body = parse(z.object({ staff_note: z.string().trim().max(1000) }), req.body);
  await repo.setNote(pool, idParam(req), body.staff_note);
  res.status(204).end();
});
