"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LANG, LANG_COOKIE, type Lang } from "./config";
import { DICTS, type Dict } from "./dict";

const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export const useT = (): Dict => DICTS[useContext(LangContext)];

/** Server components read the cookie, so a full reload re-renders everything in the new language. */
export function setLang(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  window.location.reload();
}
