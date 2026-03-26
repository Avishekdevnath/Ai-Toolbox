'use client';

/**
 * Storage utility for managing authentication in localStorage with cookie fallback
 * On logout: clears auth data but preserves theme preference
 */

const AUTH_STORAGE_KEY = 'auth_session';
const THEME_STORAGE_KEY = 'theme'; // Matches useTheme hook
const SESSION_COOKIE_NAME = 'user_session';

export interface StoredAuth {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
    phoneNumber?: string;
  };
  timestamp: number;
}

/**
 * Get all cookies as object
 */
function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  
  return document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Set a cookie
 */
function setCookie(name: string, value: string, maxAge: number = 24 * 60 * 60) {
  if (typeof document === 'undefined') return;
  
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; ${secure}Max-Age=${maxAge}`;
}

/**
 * Delete a cookie
 */
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/**
 * Save auth data to localStorage AND set cookie fallback
 */
export function saveAuthToStorage(auth: StoredAuth): void {
  try {
    // Save to localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    
    // Also set cookie as fallback (without sensitive data, just token for validation)
    setCookie(SESSION_COOKIE_NAME, auth.token);
    
    console.log('✅ Auth saved to localStorage + cookie fallback');
  } catch (error) {
    console.error('❌ Failed to save auth:', error);
    // Fallback: set cookie if localStorage fails
    try {
      setCookie(SESSION_COOKIE_NAME, auth.token);
      console.log('✅ Auth saved to cookie (localStorage failed)');
    } catch (e) {
      console.error('❌ Failed to save to both localStorage and cookie:', e);
    }
  }
}

/**
 * Retrieve auth data from localStorage (check cookie as fallback)
 */
export function getAuthFromStorage(): StoredAuth | null {
  try {
    // Try localStorage first
    const item = localStorage.getItem(AUTH_STORAGE_KEY);
    if (item) {
      return JSON.parse(item) as StoredAuth;
    }
  } catch (error) {
    console.error('❌ Failed to read from localStorage:', error);
  }

  // Fallback: Check if cookie exists (but don't restore full session from cookie)
  try {
    const cookies = getAllCookies();
    if (cookies[SESSION_COOKIE_NAME]) {
      console.log('⚠️  Cookie exists but localStorage is empty. Will refetch session from server.');
    }
  } catch (error) {
    console.error('❌ Failed to read cookie:', error);
  }

  return null;
}

/**
 * Clear all auth data from localStorage AND cookies, but preserve theme
 */
export function clearAuthFromStorage(): void {
  try {
    // Save theme before clearing
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    
    // Clear localStorage
    localStorage.removeItem(AUTH_STORAGE_KEY);
    
    // Clear cookie
    deleteCookie(SESSION_COOKIE_NAME);
    
    // Restore theme if it existed
    if (theme) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    
    console.log('✅ Auth cleared from localStorage + cookies. Theme preserved.');
  } catch (error) {
    console.error('❌ Failed to clear auth:', error);
  }
}

/**
 * Check if auth data exists in storage
 */
export function hasAuthInStorage(): boolean {
  try {
    return !!localStorage.getItem(AUTH_STORAGE_KEY) || !!getAllCookies()[SESSION_COOKIE_NAME];
  } catch {
    return false;
  }
}

/**
 * Save theme preference (preserved on logout)
 */
export function saveThemePreference(theme: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error('❌ Failed to save theme:', error);
  }
}

/**
 * Get theme preference
 */
export function getThemePreference(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.error('❌ Failed to get theme:', error);
    return null;
  }
}
