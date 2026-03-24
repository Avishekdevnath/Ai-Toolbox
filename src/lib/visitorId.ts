import { NextRequest } from 'next/server';

export const VISITOR_ID_COOKIE = 'visitorId';

/**
 * Read visitorId from a NextRequest (API routes, middleware).
 */
export function getVisitorIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get(VISITOR_ID_COOKIE)?.value ?? null;
}

/**
 * Read visitorId from the Next.js cookie store (login/register routes that use next/headers).
 * `cookies` is imported dynamically inside the function to avoid import-time errors
 * when this module is loaded outside of a request context (e.g. in tests or edge builds).
 */
export async function getVisitorIdFromCookieStore(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get(VISITOR_ID_COOKIE)?.value ?? null;
}
