import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

function getRateLimitKey(request: NextRequest): string {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  return `rate_limit:${ip}`;
}

function isRateLimited(request: NextRequest): boolean {
  const key = getRateLimitKey(request);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security headers for all responses
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Block access to sensitive files
  if (
    pathname.includes('/.env') ||
    pathname.includes('/.git') ||
    pathname.includes('/package.json') ||
    pathname.includes('/package-lock.json') ||
    pathname.includes('/yarn.lock') ||
    pathname.includes('/node_modules') ||
    pathname.includes('/.next') ||
    pathname.includes('/README.md') ||
    pathname.includes('/.gitignore')
  ) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Protect API routes
  if (pathname.startsWith('/api/')) {
    // Rate limiting for API routes
    if (isRateLimited(request)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    // Block access to admin API routes from non-admin sources
    if (pathname.startsWith('/api/admin/')) {
      // Allow admin login and verify endpoints without authentication
      if (pathname === '/api/admin/auth/login' || pathname === '/api/admin/verify') {
        return response;
      }
      
      const authHeader = request.headers.get('authorization');
      const adminToken = request.cookies.get('adminToken')?.value;
      
      if (!authHeader && !adminToken) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    // Add CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Block access to admin routes from non-admin sources
  if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
    const adminToken = request.cookies.get('adminToken')?.value;
    const authHeader = request.headers.get('authorization');
    
    if (!adminToken && !authHeader) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // Block access to internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api-docs') ||
    pathname.includes('/test-') ||
    pathname.includes('/debug')
  ) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 