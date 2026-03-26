'use client';

import {
  saveAuthToStorage,
  getAuthFromStorage,
  clearAuthFromStorage,
  hasAuthInStorage,
  type StoredAuth,
} from '@/lib/storage';

export type AuthRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: AuthRole;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

type PersistedAuthSession = {
  token: string;
  user: AuthUser;
  isAdmin: boolean;
};

const USER_SESSION_STORAGE_KEY = 'user-session';
const ADMIN_SESSION_STORAGE_KEY = 'admin-session';

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = window.atob(paddedBase64);

    return JSON.parse(decoded) as { exp?: number };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

function normalizeUser(userData: Partial<AuthUser>, fallbackRole: AuthRole): AuthUser {
  return {
    id: userData.id || '',
    username: userData.username || userData.email || '',
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email || '',
    phoneNumber: userData.phoneNumber,
    role: userData.role || fallbackRole,
  };
}

function readSession(storageKey: string, fallbackRole: AuthRole): AuthSession | null {
  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<PersistedAuthSession>;
    if (!parsed?.token || !parsed.user) {
      localStorage.removeItem(storageKey);
      return null;
    }

    if (isTokenExpired(parsed.token)) {
      localStorage.removeItem(storageKey);
      return null;
    }

    const user = normalizeUser(parsed.user, fallbackRole);

    return {
      token: parsed.token,
      user,
      isAuthenticated: true,
      isAdmin: parsed.isAdmin ?? user.role === 'admin',
    };
  } catch (error) {
    console.error('Error getting client session:', error);
    localStorage.removeItem(storageKey);
    return null;
  }
}

function writeSession(storageKey: string, sessionData: PersistedAuthSession): AuthSession {
  const user = normalizeUser(sessionData.user, sessionData.isAdmin ? 'admin' : 'user');
  const persistedSession: PersistedAuthSession = {
    token: sessionData.token,
    user,
    isAdmin: sessionData.isAdmin,
  };

  // Save to localStorage AND cookie (with fallback)
  saveAuthToStorage({
    token: persistedSession.token,
    user,
    timestamp: Date.now(),
  });

  // Also keep legacy localStorage keys for backward compatibility
  localStorage.setItem(storageKey, JSON.stringify(persistedSession));

  return {
    token: persistedSession.token,
    user,
    isAuthenticated: true,
    isAdmin: persistedSession.isAdmin,
  };
}

export class ClientAuthService {
  private static instance: ClientAuthService;
  private currentSession: AuthSession | null = null;

  private constructor() {}

  public static getInstance(): ClientAuthService {
    if (!ClientAuthService.instance) {
      ClientAuthService.instance = new ClientAuthService();
    }
    return ClientAuthService.instance;
  }

  public getCurrentSession(): AuthSession | null {
    try {
      console.log('📊 [getCurrentSession] Checking localStorage keys...');
      
      const adminSession = readSession(ADMIN_SESSION_STORAGE_KEY, 'admin');
      if (adminSession) {
        console.log('📊 [getCurrentSession] Found admin session in localStorage');
        this.currentSession = adminSession;
        return adminSession;
      }

      const userSession = readSession(USER_SESSION_STORAGE_KEY, 'user');
      if (userSession) {
        console.log('📊 [getCurrentSession] Found user session in localStorage');
        this.currentSession = userSession;
        return userSession;
      }

      console.log('📊 [getCurrentSession] No valid session in localStorage');
      this.currentSession = null;
      return null;
    } catch (error) {
      console.error('❌ [getCurrentSession] Error getting client session:', error);
      this.currentSession = null;
      return null;
    }
  }

  public isAuthenticated(): boolean {
    return Boolean(this.getCurrentSession()?.isAuthenticated);
  }

  public isAdmin(): boolean {
    return Boolean(this.getCurrentSession()?.isAdmin);
  }

  public getCurrentUser(): AuthUser | null {
    return this.getCurrentSession()?.user || null;
  }

  public signOut(): void {
    try {
      console.log('🔐 [ClientAuth] Starting signOut...');
      
      // Clear from both localStorage and cookies (preserves theme)
      clearAuthFromStorage();
      
      // Also clear legacy storage keys as backup
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      localStorage.removeItem(USER_SESSION_STORAGE_KEY);
      
      // Reset instance state
      this.currentSession = null;
      
      // Verify cleared
      const admin = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      const user = localStorage.getItem(USER_SESSION_STORAGE_KEY);
      const auth = localStorage.getItem('auth_session');
      
      console.log('🔐 [ClientAuth] After signOut cleanup:');
      console.log('  - admin-session:', admin ? 'STILL EXISTS ❌' : 'cleared ✅');
      console.log('  - user-session:', user ? 'STILL EXISTS ❌' : 'cleared ✅');
      console.log('  - auth_session:', auth ? 'STILL EXISTS ❌' : 'cleared ✅');
      
    } catch (error) {
      console.error('❌ [ClientAuth] Error during sign out:', error);
    }
  }

  public createAdminSession(adminData: { token: string; user: Partial<AuthUser> }): void {
    this.currentSession = writeSession(ADMIN_SESSION_STORAGE_KEY, {
      token: adminData.token,
      user: normalizeUser({ ...adminData.user, role: 'admin' }, 'admin'),
      isAdmin: true,
    });
  }

  public createUserSession(userData: { token: string; user: Partial<AuthUser> }): void {
    this.currentSession = writeSession(USER_SESSION_STORAGE_KEY, {
      token: userData.token,
      user: normalizeUser(
        { ...userData.user, role: userData.user.role || 'user' },
        userData.user.role || 'user',
      ),
      isAdmin: userData.user.role === 'admin',
    });
  }
}

export const clientAuthService = ClientAuthService.getInstance();

export function getClientSession(): AuthSession | null {
  return clientAuthService.getCurrentSession();
}

export function isClientAuthenticated(): boolean {
  return clientAuthService.isAuthenticated();
}

export function isClientAdmin(): boolean {
  return clientAuthService.isAdmin();
}

export function getClientUser(): AuthUser | null {
  return clientAuthService.getCurrentUser();
}

export function createClientAdminSession(adminData: { token: string; user: Partial<AuthUser> }): void {
  clientAuthService.createAdminSession(adminData);
}

export function createClientUserSession(userData: { token: string; user: Partial<AuthUser> }): void {
  clientAuthService.createUserSession(userData);
}

export function signOutClient(): void {
  clientAuthService.signOut();
}
