import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

/** First path segment after /api/ for routes served by FastAPI (see src/lib/api.ts). */
const BACKEND_API_SEGMENTS = new Set([
  "agents",
  "agent-runs",
  "estimates",
  "pricing-rules",
  "knowledge",
  "clients",
]);

export default withAuth(function middleware(request) {
  const { pathname } = request.nextUrl;
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "api" || parts[1] === "auth") {
    return NextResponse.next();
  }
  const segment = parts[1];
  if (!segment || !BACKEND_API_SEGMENTS.has(segment)) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = `/backend${pathname}`;
  return NextResponse.rewrite(url);
});

export const config = {
  // Protect all routes except /login and Next.js internals
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
