// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the cookie - adapt the name to match your implementation
  const authToken = request.cookies.get('auth-token')?.value;

  // Define public routes that don't require auth
  const publicPaths = ['/login', '/'];

  // If the route is public, allow access
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // If the auth cookie is missing, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Otherwise, continue as normal
  return NextResponse.next();
}

// Protect all routes except /login and /register
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|login|favicon.ico|.*\\..*).*)']
};
