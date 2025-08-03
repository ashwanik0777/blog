import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, let all admin routes pass through
  // Authentication is handled by the individual pages
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
  ],
}; 