import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")
  const pathname = request.nextUrl.pathname

  // Auth routes are only accessible when the user is not logged in
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/reset-password")) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Protected routes are only accessible when the user is logged in
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/enhance") || pathname.startsWith("/account")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/register", "/reset-password", "/dashboard/:path*", "/enhance/:path*", "/account/:path*"],
}
