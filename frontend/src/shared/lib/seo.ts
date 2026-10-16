import type { Metadata } from "next";
import { LANG_META, type Lang } from "@/shared/i18n/config";

/** Open Graph + Twitter card. Crawlers without a cookie see the default language (Kyrgyz). */
export function social(lang: Lang, title: string, description: string, image?: string): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      locale: LANG_META[lang].og,
      alternateLocale: [lang === "ky" ? "ru_RU" : "ky_KG"],
      siteName: "Mir",
      title,
      description,
      images: image ? [image] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}
