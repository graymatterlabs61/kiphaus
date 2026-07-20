import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cheap presence check only — real enforcement is Django rejecting
// unauthenticated/wrong-role API calls regardless of what this proxy does.
// "kh_refresh" is the httpOnly JWT refresh cookie set by the Django API on
// login/register (see api/users/views.py) — the access token itself lives in
// memory on the client and is never visible here.
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("kh_refresh")
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: [
    // /host itself is the public "become a host" landing page — must stay
    // crawlable and reachable logged-out.
    "/account/:path*",
    "/trips/:path*",
    "/wishlists/:path*",
    "/messages/:path*",
    "/rooms/:id/book",
    "/host/dashboard/:path*",
    "/host/properties/:path*",
    "/host/messages/:path*",
    "/host/subscription/:path*",
    "/host/verification/:path*",
    "/host/onboarding",
  ],
}
