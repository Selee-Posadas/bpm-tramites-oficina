import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_INTERNAL_TOKEN = 'bpm_internal_token';
const COOKIE_INTERNAL_USER = 'bpm_internal_user';
const COOKIE_EXTERNAL_TOKEN = 'bpm_external_token';
const COOKIE_EXTERNAL_USER = 'bpm_external_user';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/interno')) {
    if (pathname === '/interno/login') {
      return NextResponse.next();
    }

    const internalToken = request.cookies.get(COOKIE_INTERNAL_TOKEN)?.value;
    const internalUserCookie = request.cookies.get(COOKIE_INTERNAL_USER)?.value;

    if (!internalToken) {
      const loginUrl = new URL('/interno/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (internalUserCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(internalUserCookie));
        if (user.tipo === 'EXTERNO') {
          const loginUrl = new URL('/interno/login', request.url);
          return NextResponse.redirect(loginUrl);
        }
      } catch {
        const loginUrl = new URL('/interno/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/externo')) {
    if (pathname === '/externo/login' || pathname === '/externo/registro') {
      return NextResponse.next();
    }

    const externalToken = request.cookies.get(COOKIE_EXTERNAL_TOKEN)?.value;
    const externalUserCookie = request.cookies.get(COOKIE_EXTERNAL_USER)?.value;

    if (!externalToken) {
      const loginUrl = new URL('/externo/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (externalUserCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(externalUserCookie));
        if (user.tipo === 'INTERNO') {
          const loginUrl = new URL('/externo/login', request.url);
          return NextResponse.redirect(loginUrl);
        }
      } catch {
        const loginUrl = new URL('/externo/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/interno/:path*', '/externo/:path*'],
};
