import { NextRequest } from 'next/server';
import crypto from 'crypto';

export interface UserFingerprint {
  userId: string;
  ipAddress: string;
  userAgent: string;
  fingerprint: string;
}

/**
 * Generate a unique user ID based on IP address and user agent
 * This provides a reasonable way to track unique users without authentication
 */
export function generateUserId(request: NextRequest): string {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Create a hash of IP + User Agent for consistent user identification
  const hash = crypto.createHash('sha256');
  hash.update(`${ipAddress}-${userAgent}`);
  
  // Return a shorter, readable user ID
  return `user_${hash.digest('hex').substring(0, 8)}`;
}

/**
 * Get user fingerprint from request
 */
export function getUserFingerprint(request: NextRequest): UserFingerprint {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const userId = generateUserId(request);
  
  return {
    userId,
    ipAddress,
    userAgent,
    fingerprint: `${userId}-${ipAddress}`
  };
}

/**
 * Enhanced user tracking with session management
 */
export function getEnhancedUserId(request: NextRequest): string {
  const fingerprint = getUserFingerprint(request);
  
  // For now, use the fingerprint-based user ID
  // In the future, this could be enhanced with:
  // - Browser fingerprinting (canvas, fonts, etc.)
  // - Session cookies
  // - Device fingerprinting
  
  return fingerprint.userId;
} 