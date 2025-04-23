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

  // Páginas que requerem autenticação
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
    if (!session) {
      // Salvar a URL atual para redirecionamento após o login
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // A página de enhance agora é acessível sem autenticação
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/reset-password",
    "/dashboard/:path*",
    "/enhance/:path*",
    "/account/:path*",
    "/checkout/:path*",
  ],
}
