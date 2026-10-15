import type { Request } from "express";

export type Lang = "ru" | "ky";
export const LANGS: readonly Lang[] = ["ru", "ky"];
export const LANG_COOKIE = "mir_lang";

/** A user-facing message in every supported language. */
export interface Msg {
  ru: string;
  ky: string;
}

export const msg = (ru: string, ky: string): Msg => ({ ru, ky });

const asLang = (v: unknown): Lang | null => (v === "ru" || v === "ky" ? v : null);

/** Request language: `?lang=` (server-side reads), then `X-Lang`, then the site cookie. Russian by default. */
export function langOf(req: Request): Lang {
  return asLang(req.query?.lang) ?? asLang(req.headers["x-lang"]) ?? asLang(req.cookies?.[LANG_COOKIE]) ?? "ru";
}

/**
 * Localized SQL column: Kyrgyz value when it is filled in, Russian base column otherwise.
 * `expr` is a fixed column reference (never user input).
 */
export function col(lang: Lang, expr: string, alias = expr.split(".").pop()!) {
  return lang === "ky" ? `COALESCE(NULLIF(${expr}_ky, ''), ${expr}) AS ${alias}` : `${expr} AS ${alias}`;
}
