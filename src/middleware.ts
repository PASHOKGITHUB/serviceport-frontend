// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  
  console.log('🔍 Middleware check:', { pathname, hasToken: !!token });
  
  // Define protected routes
  const protectedPaths = ['/dashboard', '/profile', '/settings'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // Define auth routes
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // Don't redirect the root path here - let the component handle it
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // Protect routes that require authentication
  if (isProtectedPath && !token) {
    console.log('🚫 Middleware: Protected route without token, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthPath && token) {
    console.log('✅ Middleware: Authenticated user on auth page, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};