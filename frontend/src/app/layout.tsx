import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { LangProvider } from "@/shared/i18n/client";
import { LANG_META } from "@/shared/i18n/config";
import { getLang, getT } from "@/shared/i18n/server";
import { SITE_URL as site } from "@/shared/lib/site";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-unbounded", display: "swap", weight: ["500", "600", "700", "800"] });

export async function generateMetadata(): Promise<Metadata> {
  const [lang, t] = await Promise.all([getLang(), getT()]);
  return {
    metadataBase: new URL(site),
    title: { default: t.meta.title, template: "%s — Mir" },
    description: t.meta.description,
    applicationName: "Mir",
    openGraph: { type: "website", locale: LANG_META[lang].og, siteName: "Mir" },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0d0a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${manrope.variable} ${unbounded.variable}`}>
      <body className="min-h-dvh font-sans">
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
