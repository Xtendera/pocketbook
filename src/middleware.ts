import { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/login/')) {
        return;
        // return NextResponse.redirect(new URL('/home', request.url));
    }
}
 
export const config = {
  matcher: '/:path*',
}