import type { ErrorRequestHandler, Request } from "express";
import { z, ZodError } from "zod";
import { langOf, msg, type Lang, type Msg } from "./i18n.js";

z.config(z.locales.ru());

export class HttpError extends Error {
  constructor(public status: number, public text: Msg) {
    super(text.ru);
  }
}

export const notFound = (m = msg("Не найдено", "Табылган жок")) => new HttpError(404, m);
export const conflict = (m: Msg) => new HttpError(409, m);
export const invalid = (m: Msg) => new HttpError(422, m);
export const forbidden = (m = msg("Нет доступа к этому действию", "Бул аракетке уруксат жок")) => new HttpError(403, m);
export const unauthorized = (m = msg("Войдите в систему", "Системага кириңиз")) => new HttpError(401, m);

/** Custom zod message in both languages; decoded by the error handler. */
export const zmsg = (ru: string, ky: string) => JSON.stringify({ ru, ky });

function decodeIssue(message: string, lang: Lang): string | null {
  if (!message.startsWith("{")) return null;
  try {
    const m = JSON.parse(message) as Partial<Msg>;
    return m[lang] ?? null;
  } catch {
    return null;
  }
}

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

const DUPLICATE: Record<string, Msg> = {
  products_slug_key: msg(
    "Товар с таким адресом (slug) уже существует — измените название или slug",
    "Мындай даректеги (slug) товар бар — аталышын же slug'ды өзгөртүңүз",
  ),
  products_sku_key: msg("Такой SKU (артикул) уже существует", "Мындай SKU (артикул) бар"),
  categories_slug_key: msg("Категория с таким адресом (slug) уже существует", "Мындай даректеги (slug) категория бар"),
  users_username_key: msg("Этот логин занят, выберите другой", "Бул логин бош эмес, башкасын тандаңыз"),
};

const M = {
  exists: msg("Такая запись уже существует", "Мындай жазуу бар"),
  linked: msg("Запись связана с другими данными, сначала измените их", "Жазуу башка маалыматтарга байланган, адегенде аларды өзгөртүңүз"),
  rule: msg("Значение нарушает правило (например, остаток станет отрицательным)", "Маани эрежеге каршы (мисалы, калдык терс болуп калат)"),
  tooLarge: msg("Файл слишком большой", "Файл өтө чоң"),
  badRequest: msg("Неверный формат запроса", "Сурамдын форматы туура эмес"),
  invalid: msg("Неверные данные", "Маалымат туура эмес"),
  server: msg("Ошибка сервера, попробуйте чуть позже", "Сервер катасы, бир аздан кийин кайра аракет кылыңыз"),
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const lang = langOf(req);
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.text[lang] });
    return;
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const field = first?.path.join(".");
    const custom = first ? decodeIssue(first.message, lang) : null;
    const detail = custom ?? (lang === "ru" ? first?.message : null);
    const issues = err.issues.map((i) => ({ path: i.path.join("."), message: decodeIssue(i.message, lang) ?? i.message }));
    let error = M.invalid[lang];
    if (custom) error = custom;
    else if (field) error = lang === "ru" ? `Неверное поле: ${field} — ${detail}` : `Талаа туура толтурулган эмес: ${field}`;
    res.status(422).json({ error, issues });
    return;
  }
  const code = (err as { code?: string }).code;
  if (code === "23505") {
    const constraint = (err as { constraint?: string }).constraint ?? "";
    res.status(409).json({ error: (DUPLICATE[constraint] ?? M.exists)[lang] });
    return;
  }
  if (code === "23503") {
    res.status(409).json({ error: M.linked[lang] });
    return;
  }
  if (code === "23514") {
    res.status(409).json({ error: M.rule[lang] });
    return;
  }
  const status = (err as { status?: number; type?: string }).status;
  if (status === 413) {
    res.status(413).json({ error: M.tooLarge[lang] });
    return;
  }
  if (status === 400) {
    res.status(400).json({ error: M.badRequest[lang] });
    return;
  }
  console.error(err);
  res.status(500).json({ error: M.server[lang] });
};
