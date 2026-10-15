"use client";

import { LANG_META, LANGS } from "@/shared/i18n/config";
import { setLang, useLang, useT } from "@/shared/i18n/client";

export function LangSwitch({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const lang = useLang();
  const t = useT();
  const dark = tone === "dark";
  return (
    <div role="group" aria-label={t.lang.label} className={`inline-flex shrink-0 rounded-lg p-0.5 ${dark ? "bg-white/10" : "bg-ink-100"} ${className}`}>
      {LANGS.map((l) => {
        const active = l === lang;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            title={LANG_META[l].label}
            aria-label={LANG_META[l].label}
            aria-pressed={active}
            onClick={() => !active && setLang(l)}
            className={`h-7 min-w-9 rounded-md px-2 text-xs font-bold transition-colors ${
              active ? (dark ? "bg-lime-400 text-ink-950" : "bg-ink-950 text-white") : dark ? "text-ink-300 hover:text-white" : "text-ink-600 hover:text-ink-950"
            }`}
          >
            {LANG_META[l].short}
          </button>
        );
      })}
    </div>
  );
}
