import type { ErrorRequestHandler, Request } from "express";
import { z, ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const notFound = (msg = "Topilmadi") => new HttpError(404, msg);
export const conflict = (msg: string) => new HttpError(409, msg);
export const invalid = (msg: string) => new HttpError(422, msg);
export const forbidden = (msg = "Bu amal uchun ruxsat yo'q") => new HttpError(403, msg);
export const unauthorized = (msg = "Tizimga kiring") => new HttpError(401, msg);

export function parse<S extends z.ZodType>(schema: S, data: unknown): z.infer<S> {
  return schema.parse(data);
}

const pageSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(15),
  q: z.string().trim().max(120).optional().default(""),
  status: z.string().trim().max(40).optional().default(""),
});
export type PageQuery = z.infer<typeof pageSchema> & { offset: number };

export function pageOf(req: Request): PageQuery {
  const p = pageSchema.parse(req.query);
  return { ...p, offset: (p.page - 1) * p.limit };
}

export function idParam(req: Request, name = "id"): number {
  const id = Number(req.params[name]);
  if (!Number.isInteger(id) || id <= 0) throw notFound();
  return id;
}

const DUPLICATE: Record<string, string> = {
  products_slug_key: "Bunday manzilli (slug) tovar allaqachon mavjud — nom yoki slugni o'zgartiring",
  products_sku_key: "Bunday SKU (artikul) allaqachon mavjud",
  categories_slug_key: "Bunday manzilli (slug) kategoriya allaqachon mavjud",
  users_username_key: "Bunday login band, boshqasini tanlang",
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const field = first?.path.join(".");
    res.status(422).json({
      error: field ? `Maydon noto'g'ri: ${field} — ${first.message}` : "Ma'lumot noto'g'ri",
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }
  const code = (err as { code?: string }).code;
  if (code === "23505") {
    const constraint = (err as { constraint?: string }).constraint ?? "";
    res.status(409).json({ error: DUPLICATE[constraint] ?? "Bunday yozuv allaqachon mavjud" });
    return;
  }
  if (code === "23503") {
    res.status(409).json({ error: "Yozuv boshqa ma'lumotlarga bog'langan, avval ularni o'zgartiring" });
    return;
  }
  if (code === "23514") {
    res.status(409).json({ error: "Qiymat qoidaga zid (masalan, qoldiq manfiy bo'lib qoladi)" });
    return;
  }
  const status = (err as { status?: number; type?: string }).status;
  if (status === 413) {
    res.status(413).json({ error: "Fayl juda katta" });
    return;
  }
  if (status === 400) {
    res.status(400).json({ error: "So'rov formati noto'g'ri" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Server xatosi, birozdan so'ng qayta urinib ko'ring" });
};
