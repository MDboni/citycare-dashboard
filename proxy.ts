import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/session";
import { PUBLIC_PREFIXES, routes } from "@/routes";

/**
 * Next.js 16 renamed Middleware to Proxy; this is the same edge hook.
 *
 * The staff console is private end to end, so the rule is simply inverted from
 * the citizen app: everything needs a session except the sign-in screens. It is
 * still only an optimistic check on a cookie — the API re-verifies the token, the
 * session, the account status and the role on every request, and it is the API
 * that keeps a citizen out of the admin endpoints.
 */
const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(COOKIE.refreshToken)?.value);
  const isPublic = matches(pathname, PUBLIC_PREFIXES);

  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = routes.login;
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname === routes.login) {
    const url = request.nextUrl.clone();
    url.pathname = routes.home;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
