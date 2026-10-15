const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** 9490000 → "9 490 000 so'm" */
export const formatMoney = (n: number) => `${money.format(Math.round(n)).replace(/\u00a0|\u202f/g, " ")} so'm`;

export const formatNumber = (n: number) => money.format(n).replace(/\u00a0|\u202f/g, " ");

const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];

export function formatDate(iso: string, withTime = false) {
  const d = new Date(iso);
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return date;
  return `${date}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "hozirgina";
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} soat oldin`;
  return formatDate(iso, true);
}

/** +998901234567 → "+998 90 123 45 67" */
export function formatPhone(p: string) {
  const d = p.replace(/\D/g, "");
  if (d.length !== 12) return p;
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
}

export const discountPercent = (price: number, old: number | null) =>
  old && old > price ? Math.round(((old - price) / old) * 100) : 0;

export function plural(n: number, word: string) {
  return `${formatNumber(n)} ${word}`;
}
