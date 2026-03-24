import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from './src/lib/auth/jwt';

/**
 * Enhanced Middleware with:
 * - Visitor tracking
 * - Auth validation
 * - Security headers
 * - Session management
 */

const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/api/auth/(.*)',
  '/api/(.*)',
  '/_next/(.*)',
  '/favicon.ico',
  '/public/(.*)',
  '/docs/(.*)',
  '/guide/(.*)',
];

const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/profile',
  '/settings',
  '/favorites',
];

/**
 * Sets the visitorId cookie on any response if not already present
 * Used for analytics and user tracking
 */
function withVisitorId(response: NextResponse, request: NextRequest): NextResponse {
  if (!request.cookies.get('visitorId')?.value) {
    response.cookies.set('visitorId', crypto.randomUUID(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });
  }
  return response;
}

/**
 * Add security headers to response
 */
function withSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable browser XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route.endsWith('(.*)')) {
      const base = route.replace('(.*)', '');
      return pathname.startsWith(base);
    }
    return pathname === route;
  });
}

/**
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    if (route.endsWith('(.*)')) {
      const base = route.replace('(.*)', '');
      return pathname.startsWith(base);
    }
    return pathname === route;
  });
}

/**
 * Validate session token
 */
function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  
  const claims = verifyAccessToken(token);
  return claims !== null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Get session token
  const sessionToken = req.cookies.get('user_session')?.value;
  
  // Check if public route
  if (isPublicRoute(pathname)) {
    let response = NextResponse.next();
    response = withVisitorId(response, req);
    response = withSecurityHeaders(response);
    return response;
  }

  // Validate session for protected routes
  if (isProtectedRoute(pathname)) {
    if (!isValidSession(sessionToken)) {
      const url = req.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('redirectUrl', pathname);
      
      let response = NextResponse.redirect(url);
      response = withVisitorId(response, req);
      response = withSecurityHeaders(response);
      return response;
    }
  }

  // Default response with headers
  let response = NextResponse.next();
  response = withVisitorId(response, req);
  response = withSecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ],
};
