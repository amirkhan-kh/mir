import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LANG, isLang, LANG_COOKIE, type Lang } from "@/shared/i18n/config";
import { mockGet, mockQuote } from "@/shared/mock/api";

/**
 * Mock API, reached only when nothing routes `/api/v1` to the real backend
 * (Docker/dev proxy it in `beforeFiles`; Vercel routes it in vercel.json when the backend service is enabled).
 */

const MSG = {
  demo: { ru: "Демо-режим: заказы и изменения пока не принимаются", ky: "Демо режим: азырынча буйрутмалар жана өзгөртүүлөр кабыл алынбайт" },
  order: { ru: "Заказ не найден", ky: "Буйрутма табылган жок" },
  login: { ru: "Войдите в систему", ky: "Системага кириңиз" },
  missing: { ru: "Не найдено", ky: "Табылган жок" },
};

type Ctx = { params: Promise<{ path: string[] }> };

const pathOf = async (req: NextRequest, ctx: Ctx) => `/${(await ctx.params).path.join("/")}${req.nextUrl.search}`;

function langOf(req: NextRequest): Lang {
  for (const v of [req.nextUrl.searchParams.get("lang"), req.headers.get("x-lang"), req.cookies.get(LANG_COOKIE)?.value]) {
    if (isLang(v)) return v;
  }
  return DEFAULT_LANG;
}

const fail = (req: NextRequest, key: keyof typeof MSG, status: number) => NextResponse.json({ error: MSG[key][langOf(req)] }, { status });

export async function GET(req: NextRequest, ctx: Ctx) {
  const path = await pathOf(req, ctx);
  if (path.startsWith("/public/orders/")) return fail(req, "order", 404);
  if (path.startsWith("/auth/me")) return fail(req, "login", 401);
  const body = mockGet(path, langOf(req));
  if (body === undefined) return fail(req, "missing", 404);
  return NextResponse.json(body, { headers: { "cache-control": "public, max-age=60" } });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  if ((await pathOf(req, ctx)).split("?")[0] === "/public/orders/quote") {
    const json = (await req.json().catch(() => null)) as { items?: { product_id: number; qty: number }[] } | null;
    return NextResponse.json(mockQuote(Array.isArray(json?.items) ? json.items.slice(0, 50) : [], langOf(req)));
  }
  return fail(req, "demo", 503);
}

const readOnly = (req: NextRequest) => fail(req, "demo", 503);
export { readOnly as PUT, readOnly as PATCH, readOnly as DELETE };
