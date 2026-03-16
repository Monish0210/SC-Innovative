import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_PATHS = ["/login", "/signup"]

function hasAuthSessionCookie(request: NextRequest): boolean {
  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name)
  return cookieNames.some(
    (name) =>
      name === "better-auth.session_token" ||
      name === "__Secure-better-auth.session_token" ||
      name === "better-auth-session_token" ||
      name === "__Secure-better-auth-session_token"
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  if (hasAuthSessionCookie(request)) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
