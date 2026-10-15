import { NextResponse, type NextRequest } from "next/server";

/** Admin pages need a session cookie; the API re-checks it on every call. */
export function proxy(request: NextRequest) {
  if (request.cookies.has("mir_token")) return NextResponse.next();
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
