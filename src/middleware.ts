import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Public routes that don't require authentication
  const isAuthRoute = pathname.startsWith('/auth');
  
  // Skip middleware for static files and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  console.log(`Middleware: ${pathname}, token: ${!!token}`); // Debug log
  
  // If no token and trying to access protected route, redirect to login
  if (!token && !isAuthRoute) {
    console.log('Redirecting to login - no token');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // If has token and trying to access auth pages, redirect to dashboard
  if (token && isAuthRoute) {
    console.log('Redirecting to dashboard - has token');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};