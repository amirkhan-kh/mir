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
  whatsapp: z.string().trim().max(120).default(""),
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
  phone: "+996 555 323 300",
  phone2: "",
  address: "Кыргызстан, Ошская область, г. Узген, ул. Манаса, 25",
  address_ky: "Кыргызстан, Ош облусу, Өзгөн шаары, Манас көчөсү, 25",
  hours: "Ежедневно 09:00 – 20:00",
  hours_ky: "Күн сайын 09:00 – 20:00",
  whatsapp: "https://wa.me/996555323300",
  instagram: "https://instagram.com/",
  delivery_fee: 200,
  free_delivery_from: 7000,
  delivery_note: "Доставка по Узгену и Ошской области за 1–2 дня собственными курьерами",
  delivery_note_ky: "Өзгөн жана Ош облусу боюнча 1–2 күндө өз курьерлерибиз жеткирет",
  regions: ["Өзгөн", "Ош", "Кара-Суу", "Ноокат", "Араван", "Кара-Кулжа", "Алай", "Бишкек", "Жалал-Абад", "Ысык-Көл", "Нарын", "Талас", "Баткен"],
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
