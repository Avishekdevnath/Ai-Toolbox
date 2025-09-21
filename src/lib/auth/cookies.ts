import { cookies } from 'next/headers';

const AUTH_COOKIE = 'user_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value;
}


