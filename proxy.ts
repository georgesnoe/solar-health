import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "better-auth.session_token"

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(SESSION_COOKIE)

  if (pathname.startsWith("/tableau-de-bord")) {
    if (!sessionCookie) {
      const loginUrl = new URL("/connexion", request.url)
      loginUrl.searchParams.set("callbackURL", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname === "/" || pathname === "/connexion" || pathname === "/inscription") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/tableau-de-bord", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/tableau-de-bord/:path*", "/tableau-de-bord", "/", "/connexion", "/inscription"],
}
