import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/tableau-de-bord")) {
    const sessionCookie = request.cookies.get("better-auth.session_token")
    if (!sessionCookie) {
      const loginUrl = new URL("/connexion", request.url)
      loginUrl.searchParams.set("callbackURL", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/tableau-de-bord/:path*", "/tableau-de-bord"],
}
