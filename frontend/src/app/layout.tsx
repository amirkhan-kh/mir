import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { SITE_URL as site } from "@/shared/lib/site";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-unbounded", display: "swap", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Mir — maishiy texnika va elektronika", template: "%s — Mir" },
  description:
    "Mir do'koni: smartfonlar, noutbuklar, maishiy va oshxona texnikasi. Rasmiy kafolat, muddatli to'lov va o'z kuryerlarimiz orqali tez yetkazib berish.",
  applicationName: "Mir",
  openGraph: { type: "website", locale: "uz_UZ", siteName: "Mir" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${manrope.variable} ${unbounded.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
