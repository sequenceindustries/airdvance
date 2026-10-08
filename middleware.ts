import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "airdvance.co.za";
const PRIVATE = /^\/(admin|dashboard|api|verify|apply|login|register|forgot-password)(\/|$)/;

function isLocal(host: string) {
  return /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)(:\d+)?$/.test(host);
}

/**
 * 1. One canonical origin: anything not on https://airdvance.co.za (the Railway
 *    *.up.railway.app domain, www., plain http) gets a 301 to the same path there.
 *    The health check is exempt so Railway's probe isn't redirected.
 * 2. Private areas get an X-Robots-Tag: noindex header as well as the meta tag.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").toLowerCase();
  // Only trust the edge proxy's header: the hop from Railway's proxy to this container is plain http.
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0].trim();

  if (pathname !== "/api/health" && !isLocal(host) && host && (host !== CANONICAL_HOST || proto === "http")) {
    return NextResponse.redirect(`https://${CANONICAL_HOST}${pathname}${search}`, 301);
  }

  const res = NextResponse.next();
  if (PRIVATE.test(pathname)) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
