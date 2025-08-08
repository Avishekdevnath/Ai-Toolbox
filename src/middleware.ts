import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response object
  const response = NextResponse.next();

  // ALL routes are public - no authentication required
  const publicRoutes = [
    '/',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
    '/api/auth/signin',
    '/api/auth/signup',
    '/api/auth/logout',
    '/api/auth/session',
    '/sign-in',
    '/sign-up',
    '/admin-login',
    '/api/admin/auth/login',
    '/api/admin/verify',
    '/favicon.ico',
    '/_next',
    '/api/analytics',
    '/api/tools',
    '/tools', // Make all tools publicly accessible
    '/ai-tools', // Make AI tools publicly accessible
    '/utilities', // Make utilities publicly accessible
    '/api/url-shortener', // Make URL shortener API publicly accessible
    '/api/redirect', // Make redirect API publicly accessible
    '/api/analyze', // Make analysis APIs publicly accessible
    '/api/quote', // Make quote API publicly accessible
    '/api/currency', // Make currency API publicly accessible
    '/api/health', // Make health API publicly accessible
    '/api/recommendations', // Make recommendations API publicly accessible
    '/api/resume', // Make resume API publicly accessible
    '/api/interview', // Make interview API publicly accessible
    '/api/price-tracker', // Make price tracker API publicly accessible
    '/api/test', // Make test APIs publicly accessible
    '/api/system', // Make system APIs publicly accessible
    '/api/user', // Make user APIs publicly accessible
    '/api/admin', // Make admin APIs publicly accessible (for admin login)
    '/api-docs', // Make API docs publicly accessible
    '/stories', // Make Storybook publicly accessible
    '/admin-debug', // Make admin debug publicly accessible
    '/clerk-auth-test', // Make clerk tests publicly accessible
    '/clerk-diagnostic', // Make clerk diagnostic publicly accessible
    '/clerk-simple-test', // Make clerk simple test publicly accessible
    '/clerk-test', // Make clerk test publicly accessible
    '/email-debug', // Make email debug publicly accessible
    '/oauth-callback', // Make oauth callback publicly accessible
    '/oauth-setup-guide', // Make oauth setup guide publicly accessible
    '/oauth-test', // Make oauth test publicly accessible
    '/simple-auth', // Make simple auth publicly accessible
    '/simple-auth-test', // Make simple auth test publicly accessible
    '/sso-callback', // Make sso callback publicly accessible
    '/test-auth', // Make test auth publicly accessible
    '/test-clerk', // Make test clerk publicly accessible
    '/test-clerk-login', // Make test clerk login publicly accessible
    '/test-email', // Make test email publicly accessible
    '/test-signup-email', // Make test signup email publicly accessible
    '/verify-email', // Make verify email publicly accessible
    '/forgot-password', // Make forgot password publicly accessible
    '/reset-password', // Make reset password publicly accessible
    '/oauth-callback', // Make oauth callback publicly accessible
    '/r', // Make redirect routes publicly accessible
  ];

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Also allow short code routes (like /abc123) without authentication
  const isShortCodeRoute = /^\/[a-zA-Z0-9_-]{3,20}$/.test(pathname);

  // Allow all routes that start with /tools/ or /ai-tools/ or /utilities/
  const isToolRoute = pathname.startsWith('/tools/') || 
                     pathname.startsWith('/ai-tools/') || 
                     pathname.startsWith('/utilities/');

  // Allow all API routes that don't require authentication
  const isPublicApiRoute = pathname.startsWith('/api/') && 
                          !pathname.startsWith('/api/admin/') && 
                          pathname !== '/api/admin/auth/login';

  // ALLOW ALL ROUTES - NO AUTHENTICATION REQUIRED
  if (isPublicRoute || isShortCodeRoute || isToolRoute || isPublicApiRoute || true) {
    return response;
  }

  // Only require authentication for admin dashboard (not admin login)
  if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
    const adminToken = request.cookies.get('adminToken')?.value;
    
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  return response;
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