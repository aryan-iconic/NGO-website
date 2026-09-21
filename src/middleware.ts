import { NextRequest, NextResponse } from "next/server";

// Lightweight presence check only (cookie exists) — the real authorization
// check (signature + expiry + admin still exists) happens in requireAdmin()
// on every API route and in getCurrentAdminId() on every server page. This
// middleware just avoids flashing the admin shell before that check runs.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasAdminCookie = req.cookies.has("snt_admin_session");
    if (!hasAdminCookie) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
