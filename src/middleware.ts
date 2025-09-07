import { NextRequest, NextResponse } from 'next/server';
import { extractTokenBody } from './utils/jwt';

const week = 24 * 60 * 60 * 1000 * 7;

async function authenticate(token: string): Promise<boolean> {
  const body = await extractTokenBody(token);
  if (!body) {
    return false;
  }
  const xpr = body.iat * 1000 + week;
  if (Date.now() > xpr) {
    return false;
  }
  return true;
}

export async function middleware(request: NextRequest) {
  let isAuth = false;
  const cookie = request.cookies.get('jwt');
  if (cookie && await authenticate(cookie.value)) {
    isAuth = true;
  }
  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/login/')
  ) {
    if (isAuth)
      return NextResponse.redirect(new URL('/', request.url));

    return;
  }
  // Path is NOT login.
  if (!isAuth && !request.nextUrl.pathname.startsWith('/_next/') && !request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: '/:path*',
};
