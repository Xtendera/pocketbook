import { NextRequest, NextResponse } from 'next/server';
import { extractTokenBody } from './utils/jwt';

const week = 24 * 60 * 60 * 1000 * 7;

async function authenticate(
  token: string,
): Promise<{ isValid: boolean; userId?: string; username?: string }> {
  const body = await extractTokenBody(token);
  if (!body) {
    return { isValid: false };
  }
  const xpr = body.iat * 1000 + week;
  if (Date.now() > xpr) {
    return { isValid: false };
  }

  return { isValid: true, userId: body.sub, username: body.user };
}

export async function middleware(request: NextRequest) {
  let authResult: { isValid: boolean; userId?: string; username?: string } = {
    isValid: false,
  };
  const cookie = request.cookies.get('jwt');
  if (cookie) {
    authResult = await authenticate(cookie.value);
  }

  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/login/') ||
    request.nextUrl.pathname === '/register' ||
    request.nextUrl.pathname.startsWith('/register/')
  ) {
    if (authResult.isValid)
      return NextResponse.redirect(new URL('/', request.url));

    return;
  }

  // Path is NOT login.
  if (
    !authResult.isValid &&
    !request.nextUrl.pathname.startsWith('/_next/') &&
    !request.nextUrl.pathname.startsWith('/api/')
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated, add user info to headers for tRPC context
  if (authResult.isValid && authResult.userId) {
    const response = NextResponse.next();
    response.headers.set('x-user-id', authResult.userId);
    response.headers.set('x-username', authResult.username || '');
    return response;
  }
}

export const config = {
  matcher: '/:path*',
  runtime: 'nodejs',
};
