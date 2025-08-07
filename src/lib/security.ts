import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

// Security configuration
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://ai-toolbox.com',
  'https://www.ai-toolbox.com',
  // Add your production domains here
];

const BLOCKED_USER_AGENTS = [
  'bot',
  'crawler',
  'spider',
  'scraper',
  'curl',
  'wget',
  'python',
  'java',
  'php',
];

export interface SecurityValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

export function validateRequest(request: NextRequest): SecurityValidationResult {
  const userAgent = request.headers.get('user-agent') || '';
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  const method = request.method;

  // Block suspicious user agents
  const isBlockedUserAgent = BLOCKED_USER_AGENTS.some(blocked => 
    userAgent.toLowerCase().includes(blocked.toLowerCase())
  );

  if (isBlockedUserAgent) {
    return {
      isValid: false,
      error: 'Access denied',
      statusCode: 403,
    };
  }

  // Validate origin for API requests
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return {
        isValid: false,
        error: 'Invalid origin',
        statusCode: 403,
      };
    }
  }

  // Block suspicious methods
  if (!['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].includes(method)) {
    return {
      isValid: false,
      error: 'Method not allowed',
      statusCode: 405,
    };
  }

  // Validate content type for POST/PUT requests
  if (['POST', 'PUT'].includes(method)) {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      return {
        isValid: false,
        error: 'Invalid content type',
        statusCode: 400,
      };
    }
  }

  return { isValid: true };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}

// Rate limiting utilities
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = `rate_limit:${identifier}`;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute 