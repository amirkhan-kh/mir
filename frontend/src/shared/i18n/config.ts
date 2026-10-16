export type Lang = "ru" | "ky";

export const LANGS: readonly Lang[] = ["ky", "ru"];
export const DEFAULT_LANG: Lang = "ky";
/** Read by the Next server, the mock API and the Express API alike. */
export const LANG_COOKIE = "mir_lang";

export const LANG_META: Record<Lang, { short: string; label: string; og: string }> = {
  ru: { short: "RU", label: "Русский", og: "ru_RU" },
  ky: { short: "KY", label: "Кыргызча", og: "ky_KG" },
};

export const isLang = (v: unknown): v is Lang => v === "ru" || v === "ky";

/** Language from a `document.cookie` string. */
export function langFromCookie(cookie: string): Lang {
  const v = cookie.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]+)`))?.[1];
  return isLang(v) ? v : DEFAULT_LANG;
}
