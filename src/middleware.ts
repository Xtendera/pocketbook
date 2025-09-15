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
  
  // Debug logging for Vercel
  console.log('Middleware - All cookies:', request.cookies.getAll());
  console.log('Middleware - Cookie header:', request.headers.get('cookie'));
  
  const cookie = request.cookies.get('jwt');
  console.log('Middleware - JWT cookie:', cookie);
  
  if (cookie) {
    authResult = await authenticate(cookie.value);
    console.log('Middleware - Auth result:', authResult);
  } else {
    console.log('Middleware - No JWT cookie found');
  }

  if (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/login/')
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
