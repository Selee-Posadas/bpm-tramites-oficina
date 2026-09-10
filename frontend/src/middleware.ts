import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_INTERNAL_TOKEN = 'bpm_internal_token';
const COOKIE_INTERNAL_USER = 'bpm_internal_user';
const COOKIE_EXTERNAL_TOKEN = 'bpm_external_token';
const COOKIE_EXTERNAL_USER = 'bpm_external_user';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/interno')) {
    const internalToken = request.cookies.get(COOKIE_INTERNAL_TOKEN)?.value;
    const internalUserCookie = request.cookies.get(COOKIE_INTERNAL_USER)?.value;

    if (pathname === '/interno/login') {
      return NextResponse.next();
    }

    if (!internalToken || !internalUserCookie) {
      const loginUrl = new URL('/interno/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      if (internalToken) res.cookies.delete(COOKIE_INTERNAL_TOKEN);
      if (internalUserCookie) res.cookies.delete(COOKIE_INTERNAL_USER);
      return res;
    }

    try {
      const user = JSON.parse(decodeURIComponent(internalUserCookie));
      if (user.tipo !== 'INTERNO') {
        const loginUrl = new URL('/interno/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete(COOKIE_INTERNAL_TOKEN);
        res.cookies.delete(COOKIE_INTERNAL_USER);
        return res;
      }
    } catch {
      const loginUrl = new URL('/interno/login', request.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(COOKIE_INTERNAL_TOKEN);
      res.cookies.delete(COOKIE_INTERNAL_USER);
      return res;
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/externo')) {
    const externalToken = request.cookies.get(COOKIE_EXTERNAL_TOKEN)?.value;
    const externalUserCookie = request.cookies.get(COOKIE_EXTERNAL_USER)?.value;

    if (pathname === '/externo/login' || pathname === '/externo/registro') {
      if (externalToken && externalUserCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(externalUserCookie));
          if (user.tipo === 'EXTERNO') {
            return NextResponse.redirect(new URL('/externo/mis-tramites', request.url));
          }
        } catch {
        }
      }
      return NextResponse.next();
    }

    if (!externalToken || !externalUserCookie) {
      const loginUrl = new URL('/externo/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      if (externalToken) res.cookies.delete(COOKIE_EXTERNAL_TOKEN);
      if (externalUserCookie) res.cookies.delete(COOKIE_EXTERNAL_USER);
      return res;
    }

    try {
      const user = JSON.parse(decodeURIComponent(externalUserCookie));
      if (user.tipo !== 'EXTERNO') {
        const loginUrl = new URL('/externo/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete(COOKIE_EXTERNAL_TOKEN);
        res.cookies.delete(COOKIE_EXTERNAL_USER);
        return res;
      }
    } catch {
      const loginUrl = new URL('/externo/login', request.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(COOKIE_EXTERNAL_TOKEN);
      res.cookies.delete(COOKIE_EXTERNAL_USER);
      return res;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/interno/:path*', '/externo/:path*'],
};
