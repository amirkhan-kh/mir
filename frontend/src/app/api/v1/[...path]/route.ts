import { NextResponse, type NextRequest } from "next/server";
import { mockGet, mockQuote } from "@/shared/mock/api";

/**
 * Mock API, reached only when nothing routes `/api/v1` to the real backend
 * (Docker/dev proxy it in `beforeFiles`; Vercel routes it in vercel.json when the backend service is enabled).
 */

const DEMO = "Demo rejim: hozircha buyurtma va o'zgartirishlar qabul qilinmaydi";

type Ctx = { params: Promise<{ path: string[] }> };

const pathOf = async (req: NextRequest, ctx: Ctx) => `/${(await ctx.params).path.join("/")}${req.nextUrl.search}`;

export async function GET(req: NextRequest, ctx: Ctx) {
  const path = await pathOf(req, ctx);
  if (path.startsWith("/public/orders/")) return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
  if (path.startsWith("/auth/me")) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  const body = mockGet(path);
  if (body === undefined) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json(body, { headers: { "cache-control": "public, max-age=60" } });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const path = await pathOf(req, ctx);
  if (path === "/public/orders/quote") {
    const json = (await req.json().catch(() => null)) as { items?: { product_id: number; qty: number }[] } | null;
    return NextResponse.json(mockQuote(Array.isArray(json?.items) ? json.items.slice(0, 50) : []));
  }
  return NextResponse.json({ error: DEMO }, { status: 503 });
}

const readOnly = () => NextResponse.json({ error: DEMO }, { status: 503 });
export { readOnly as PUT, readOnly as PATCH, readOnly as DELETE };
