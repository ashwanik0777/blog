import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getClientIp, rateLimit } from "@/lib/security";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const MAX_API_BODY_BYTES = 6 * 1024 * 1024;

function json(status: number, error: string, headers?: Record<string, string>) {
  return NextResponse.json({ error }, { status, headers });
}

function isCrossSite(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return true;

  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

const LEGACY_BLOG_PATH = /^\/blog\/([a-f0-9]{24})\/?$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacy = LEGACY_BLOG_PATH.exec(pathname);
  if (legacy) {
    return NextResponse.rewrite(new URL(`/api/legacy-blog/${legacy[1]}`, request.url));
  }

  if (pathname.startsWith("/api/")) {
    // Coarse per-IP ceiling for every API route (individual routes add stricter limits).
    const limit = rateLimit(`api:${getClientIp(request)}`, 240, 60 * 1000);
    if (!limit.ok) {
      return json(429, "Too many requests. Please slow down.", { "Retry-After": String(limit.retryAfter) });
    }

    if (MUTATING_METHODS.has(request.method)) {
      // CSRF: state-changing requests must come from this site.
      // The one-click unsubscribe endpoint is authorised by a signed token, not cookies.
      if (pathname !== "/api/newsletter/unsubscribe" && isCrossSite(request)) {
        return json(403, "Cross-site request blocked");
      }

      const length = Number(request.headers.get("content-length") || 0);
      if (length > MAX_API_BODY_BYTES) return json(413, "Request body too large");
    }

    return NextResponse.next();
  }

  // Dashboard pages need a session cookie; the APIs re-verify it on every call.
  if (pathname.startsWith("/admin/dashboard") && !request.cookies.get("admin_session")?.value) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/dashboard/:path*", "/blog/:id"],
};
