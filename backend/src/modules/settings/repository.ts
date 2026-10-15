import { z } from "zod";
import type { Db } from "../../core/db.js";
import { zmsg } from "../../core/http.js";
import type { Lang } from "../../core/i18n.js";

/** Store texts that have a Kyrgyz twin `<key>_ky`. */
const LOCALIZED = ["tagline", "address", "hours", "delivery_note"] as const;

export const storeSchema = z.object({
  store_name: z.string().trim().min(1).max(60),
  tagline: z.string().trim().max(120).default(""),
  tagline_ky: z.string().trim().max(120).default(""),
  phone: z.string().trim().min(5).max(30),
  phone2: z.string().trim().max(30).default(""),
  address: z.string().trim().max(240).default(""),
  address_ky: z.string().trim().max(240).default(""),
  hours: z.string().trim().max(80).default(""),
  hours_ky: z.string().trim().max(80).default(""),
  telegram: z.string().trim().max(120).default(""),
  instagram: z.string().trim().max(120).default(""),
  delivery_fee: z.coerce.number().min(0).max(1e9),
  free_delivery_from: z.coerce.number().min(0).max(1e12),
  delivery_note: z.string().trim().max(160).default(""),
  delivery_note_ky: z.string().trim().max(160).default(""),
  regions: z.array(z.string().trim().min(2).max(60)).min(1).max(30),
  installment: z
    .array(z.object({ months: z.coerce.number().int().min(1).max(60), percent: z.coerce.number().min(0).max(200) }))
    .max(8)
    .refine((a) => new Set(a.map((i) => i.months)).size === a.length, zmsg("Сроки не должны повторяться", "Мөөнөттөр кайталанбасын")),
});
export type Store = z.infer<typeof storeSchema>;

export const DEFAULT_STORE: Store = {
  store_name: "Mir",
  tagline: "Бытовая техника и электроника",
  tagline_ky: "Тиричилик техникасы жана электроника",
  phone: "+998 90 000 00 00",
  phone2: "",
  address: "г. Андижан",
  address_ky: "Анжиян шаары",
  hours: "Ежедневно 09:00 – 20:00",
  hours_ky: "Күн сайын 09:00 – 20:00",
  telegram: "https://t.me/",
  instagram: "https://instagram.com/",
  delivery_fee: 30000,
  free_delivery_from: 1000000,
  delivery_note: "Доставка по Андижану за 1–2 дня собственными курьерами",
  delivery_note_ky: "Анжиян боюнча 1–2 күндө өз курьерлерибиз жеткирет",
  regions: [
    "Андижан", "г. Ташкент", "Ташкентская область", "Бухара", "Фергана", "Джизак", "Хорезм", "Наманган",
    "Навои", "Кашкадарья", "Каракалпакстан", "Самарканд", "Сырдарья", "Сурхандарья",
  ],
  installment: [
    { months: 3, percent: 0 },
    { months: 6, percent: 12 },
    { months: 12, percent: 24 },
  ],
};

export async function getStore(db: Db): Promise<Store> {
  const { rows } = await db.query("SELECT value FROM settings WHERE key = 'store'");
  return rows[0] ? { ...DEFAULT_STORE, ...rows[0].value } : DEFAULT_STORE;
}

/** Public view: texts in the request language, without the `_ky` twins. */
export function localizeStore(store: Store, lang: Lang) {
  const out: Record<string, unknown> = { ...store };
  for (const key of LOCALIZED) {
    const ky = store[`${key}_ky`];
    if (lang === "ky" && ky) out[key] = ky;
    delete out[`${key}_ky`];
  }
  return out;
}

export async function putStore(db: Db, value: Store) {
  await db.query(
    `INSERT INTO settings (key, value) VALUES ('store', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [JSON.stringify(value)],
  );
  return value;
}
