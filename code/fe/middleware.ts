import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/auth/login', '/public', '/'];

// Define role-based route prefixes
const roleRoutes = {
  '/student': 'STUDENT',
  '/tutor': 'TUTOR',
  '/coord': 'COORDINATOR',
  '/dept': 'DEPARTMENT_CHAIR',
  '/admin': 'PROGRAM_ADMIN',
  '/sa': 'STUDENT_AFFAIRS',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for access_token cookie
  const accessToken = request.cookies.get('access_token');

  if (!accessToken) {
    // No cookie, redirect to login with error reason
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'not_authenticated');
    return NextResponse.redirect(loginUrl);
  }

  // Cookie exists, allow the request to proceed
  // Role-based authorization will be handled by ProtectedRoute component
  // on the client side with API call to /users/me
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|logo-hcmut.png|.*\\..*|public).*)',
  ],
};
