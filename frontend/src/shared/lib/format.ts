import type { Dict } from "@/shared/i18n/dict";

const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** Kyrgyz som — the same word in Russian and Kyrgyz. */
export const CURRENCY = "сом";

export const formatNumber = (n: number) => money.format(Math.round(n)).replace(/\u00a0|\u202f/g, " ");

/** 65400 → "65 400 сом" */
export const formatMoney = (n: number) => `${formatNumber(n)} ${CURRENCY}`;

const pad = (n: number) => String(n).padStart(2, "0");

/** "21.09.2026" or "21.09.2026, 14:05" — numeric, so it reads the same in both languages. */
export function formatDate(iso: string, withTime = false) {
  const d = new Date(iso);
  const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  return withTime ? `${date}, ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

export function formatRelative(iso: string, t: Dict["time"]) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return t.now;
  if (min < 60) return t.min(min);
  const h = Math.round(min / 60);
  if (h < 24) return t.hour(h);
  return formatDate(iso, true);
}

/** +996555123456 → "+996 555 123 456" */
export function formatPhone(p: string) {
  const d = p.replace(/\D/g, "");
  if (d.length !== 12) return p;
  return `+${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
}

export const discountPercent = (price: number, old: number | null) =>
  old && old > price ? Math.round(((old - price) / old) * 100) : 0;
