import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  '/public/(.*)'
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((route) => {
    if (route.endsWith('(.*)')) {
      const base = route.replace('(.*)', '');
      return pathname.startsWith(base);
    }
    return pathname === route;
  });

  if (isPublic) return NextResponse.next();

  const token = req.cookies.get('user_session')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ],
};