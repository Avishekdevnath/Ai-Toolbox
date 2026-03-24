import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthCookie } from './auth/cookies';
import { verifyAccessToken } from './auth/jwt';

/**
 * Enhanced Authentication Error Types
 */
export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Rate Limiting for Authentication
 * Tracks login attempts and prevents brute force attacks
 */
interface RateLimitStore {
  [key: string]: {
    attempts: number;
    firstAttempt: number;
    lockedUntil?: number;
  };
}

export class RateLimiter {
  private static store: RateLimitStore = {};
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  static isLocked(identifier: string): boolean {
    const record = this.store[identifier];
    if (!record?.lockedUntil) return false;
    
    if (Date.now() > record.lockedUntil) {
      delete this.store[identifier];
      return false;
    }
    return true;
  }

  static recordAttempt(identifier: string): boolean {
    const now = Date.now();
    const record = this.store[identifier];

    // Check if locked
    if (record?.lockedUntil && now < record.lockedUntil) {
      return false;
    }

    // Initialize or reset if window expired
    if (!record || now - record.firstAttempt > this.WINDOW_MS) {
      this.store[identifier] = {
        attempts: 1,
        firstAttempt: now,
      };
      return true;
    }

    // Increment attempts
    record.attempts++;

    // Lock account if max attempts exceeded
    if (record.attempts >= this.MAX_ATTEMPTS) {
      record.lockedUntil = now + this.LOCK_DURATION_MS;
      return false;
    }

    return true;
  }

  static reset(identifier: string): void {
    delete this.store[identifier];
  }

  static getRemainingAttempts(identifier: string): number {
    const record = this.store[identifier];
    if (!record) return this.MAX_ATTEMPTS;
    return Math.max(0, this.MAX_ATTEMPTS - record.attempts);
  }

  static getLockStatus(identifier: string): {
    isLocked: boolean;
    remainingTime: number;
  } {
    const record = this.store[identifier];
    if (!record?.lockedUntil) {
      return { isLocked: false, remainingTime: 0 };
    }

    const remainingTime = Math.max(0, record.lockedUntil - Date.now());
    return {
      isLocked: remainingTime > 0,
      remainingTime,
    };
  }
}

/**
 * Session Validator
 * Validates and manages user sessions
 */
export interface SessionData {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'super_admin';
  createdAt: number;
  expiresAt: number;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionValidator {
  static async getCurrentSession(request: NextRequest): Promise<SessionData | null> {
    try {
      const token = await getAuthCookie();
      if (!token) return null;

      const claims = verifyAccessToken(token);
      if (!claims) return null;

      const clientIp = this.getClientIp(request);
      const userAgent = request.headers.get('user-agent') || '';

      return {
        userId: claims.id,
        email: claims.email,
        role: claims.role,
        createdAt: claims.iat * 1000,
        expiresAt: (claims.iat + 7 * 24 * 60 * 60) * 1000, // 7 days from iat
        ipAddress: clientIp,
        userAgent,
      };
    } catch (error) {
      return null;
    }
  }

  static getClientIp(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    );
  }

  static isSessionValid(session: SessionData): boolean {
    return session.expiresAt > Date.now();
  }
}

/**
 * Auth Response Helper
 * Standardizes authentication error responses
 */
export class AuthResponse {
  static unauthorized(message: string = 'Unauthorized', details?: Record<string, any>) {
    return NextResponse.json(
      {
        error: 'UNAUTHORIZED',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  static forbidden(message: string = 'Forbidden', details?: Record<string, any>) {
    return NextResponse.json(
      {
        error: 'FORBIDDEN',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    );
  }

  static badRequest(message: string = 'Bad Request', details?: Record<string, any>) {
    return NextResponse.json(
      {
        error: 'BAD_REQUEST',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  static tooManyRequests(message: string = 'Too Many Requests', retryAfter?: number) {
    const headers = new Headers();
    if (retryAfter) {
      headers.set('Retry-After', retryAfter.toString());
    }

    return NextResponse.json(
      {
        error: 'TOO_MANY_REQUESTS',
        message,
        retryAfter,
        timestamp: new Date().toISOString(),
      },
      { status: 429, headers }
    );
  }

  static success(data: any, message: string = 'Success') {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

/**
 * Auth Middleware Helper
 * Provides common auth middleware functions
 */
export async function requireAuth(request: NextRequest) {
  const session = await SessionValidator.getCurrentSession(request);
  
  if (!session) {
    return AuthResponse.unauthorized('Session expired or invalid');
  }

  if (!SessionValidator.isSessionValid(session)) {
    return AuthResponse.unauthorized('Session has expired');
  }

  return session;
}

export async function requireAdmin(request: NextRequest) {
  const session = await requireAuth(request);
  
  if (session instanceof NextResponse) {
    return session;
  }

  if (session.role !== 'admin' && session.role !== 'super_admin') {
    return AuthResponse.forbidden('Admin access required');
  }

  return session;
}

/**
 * Auth Utilities
 */
export const authUtils = {
  /**
   * Check if email is valid
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check if password meets security requirements
   */
  isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Hash a password (placeholder - use bcrypt in real implementation)
   */
  async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt: bcrypt.hash(password, 10)
    return password; // Placeholder
  },

  /**
   * Compare passwords (placeholder - use bcrypt in real implementation)
   */
  async comparePasswords(password: string, hash: string): Promise<boolean> {
    // In production, use bcrypt: bcrypt.compare(password, hash)
    return password === hash; // Placeholder
  },
};
