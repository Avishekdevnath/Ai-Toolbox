import { ObjectId } from 'mongodb';
import { 
  ShortenedUrl, 
  CreateUrlRequest, 
  ClickEvent, 
  UrlStats,
  RESERVED_PATHS,
  generateProfessionalCode,
  extractDomain,
  isAnonymousUser,
  getUserIdentifier
} from '@/schemas/urlShortenerSchema';

// Interfaces are now imported from schemas

export interface BulkUrlRequest {
  urls: Array<{
    originalUrl: string;
    customAlias?: string;
    expiresInDays?: number;
    tags?: string[];
    description?: string;
  }>;
  userId?: string;
  anonymousUserId?: string;
}

export interface AnonymousUserSession {
  sessionId: string;
  deviceFingerprint: string;
  createdAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  totalUrlsCreated: number;
}

/**
 * Generate a unique anonymous user ID
 * @returns string - Unique anonymous user ID
 */
export function generateAnonymousUserId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `anon_${timestamp}_${random}`;
}

/**
 * Generate a unique device fingerprint for anonymous users
 * @returns Promise<string> - Unique device fingerprint
 */
export async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown',
    navigator.platform,
    navigator.cookieEnabled ? '1' : '0',
    navigator.doNotTrack || 'unknown'
  ];

  // Add canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint 🖥️', 2, 2);
      components.push(canvas.toDataURL());
    }
  } catch (e) {
    components.push('canvas-error');
  }

  // Create hash from components
  const fingerprint = components.join('|');
  return await hashString(fingerprint);
}

/**
 * Hash a string using SHA-256
 * @param str - String to hash
 * @returns Promise<string> - Hashed string
 */
async function hashString(str: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side fallback
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  } catch (e) {
    // Fallback to simple hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 16);
  }
}

/**
 * Get or create anonymous user session
 * @returns Promise<AnonymousUserSession>
 */
export async function getAnonymousUserSession(): Promise<AnonymousUserSession> {
  if (typeof window === 'undefined') {
    throw new Error('Anonymous user session can only be created on client-side');
  }

  // Check if session exists in localStorage
  const existingSession = localStorage.getItem('url_shortener_session');
  if (existingSession) {
    try {
      const session = JSON.parse(existingSession);
      // Update last activity
      session.lastActivity = new Date();
      localStorage.setItem('url_shortener_session', JSON.stringify(session));
      return session;
    } catch (e) {
      // Invalid session, create new one
    }
  }

  // Create new session
  const deviceFingerprint = await generateDeviceFingerprint();
  const sessionId = generateShortCode(12);
  
  const session: AnonymousUserSession = {
    sessionId,
    deviceFingerprint,
    createdAt: new Date(),
    lastActivity: new Date(),
    totalUrlsCreated: 0
  };

  localStorage.setItem('url_shortener_session', JSON.stringify(session));
  return session;
}

/**
 * Get anonymous user URLs from database
 * @param db - Database connection
 * @param anonymousUserId - Anonymous user ID
 * @returns Promise<ShortenedUrl[]>
 */
export async function getAnonymousUserUrls(
  db: any, 
  anonymousUserId: string
): Promise<ShortenedUrl[]> {
  try {
    const urls = await db.collection('shortened_urls')
      .find({ 
        anonymousUserId,
        isActive: true 
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return urls.map(url => ({
      ...url,
      isExpired: isUrlExpired(url)
    }));
  } catch (error) {
    console.error('Error fetching anonymous user URLs:', error);
    return [];
  }
}

/**
 * Check if a URL is accessible (link health monitoring)
 * @param url - URL to check
 * @returns Promise<boolean> - True if accessible
 */
export async function checkUrlHealth(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    return response.ok;
  } catch (error) {
    console.error('URL health check failed:', error);
    return false;
  }
}

/**
 * Generate a professional short code with brand-friendly patterns
 * @returns Professional short code
 */
export function generateProfessionalCode(): string {
  const prefixes = ['go', 'link', 'url', 'web', 'app', 'get', 'visit', 'open', 'jump'];
  const suffixes = ['pro', 'hub', 'io', 'app', 'link', 'url', 'web', 'go', 'now', 'fast'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const number = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  
  return `${prefix}${suffix}${number}`;
}

/**
 * Generate a random short code
 * @param length - Length of the code (default: 6)
 * @returns Random alphanumeric string
 */
export function generateShortCode(length: number = 6): string {
  if (length < 1 || length > 20) {
    throw new Error('Short code length must be between 1 and 20');
  }
  
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a memorable short code using AI-inspired patterns
 * @returns Memorable short code
 */
export function generateMemorableCode(): string {
  const adjectives = ['fast', 'quick', 'smart', 'cool', 'best', 'top', 'new', 'hot', 'big', 'tiny', 'super', 'mega', 'ultra', 'pro', 'max'];
  const nouns = ['link', 'url', 'web', 'site', 'page', 'go', 'jump', 'fly', 'run', 'dash', 'zoom', 'boost', 'rocket', 'flash', 'bolt'];
  const numbers = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj}${noun}${numbers}`;
}

/**
 * Validate if a URL is properly formatted
 * @param url - URL to validate
 * @returns True if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalize URL by adding protocol if missing
 * @param url - URL to normalize
 * @returns Normalized URL
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    throw new Error('URL must be a non-empty string');
  }
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    throw new Error('URL cannot be empty');
  }
  
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return `https://${trimmedUrl}`;
  }
  
  return trimmedUrl;
}

/**
 * Validate custom alias format
 * @param alias - Custom alias to validate
 * @returns True if valid, false otherwise
 */
export function isValidCustomAlias(alias: string): boolean {
  if (!alias || typeof alias !== 'string') {
    return false;
  }
  
  // Must be 3-20 characters, letters, numbers, hyphens, and underscores only
  const aliasRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return aliasRegex.test(alias);
}

/**
 * Generate expiration date from number of days
 * @param days - Number of days from now
 * @returns Date object
 */
export function generateExpirationDate(days: number): Date {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  return expirationDate;
}

/**
 * Check if a URL is expired
 * @param url - ShortenedUrl object
 * @returns True if expired, false otherwise
 */
export function isUrlExpired(url: ShortenedUrl): boolean {
  if (!url.expiresAt) {
    return false; // No expiration date means never expires
  }
  
  return new Date() > new Date(url.expiresAt);
}

/**
 * Generate a unique short code
 * @param db - Database connection
 * @param collection - Collection name
 * @param useMemorable - Whether to use memorable codes
 * @returns Promise<string> - Unique short code
 */
export async function generateUniqueShortCode(
  db: any,
  collection: string,
  useMemorable: boolean = false
): Promise<string> {
  const maxAttempts = 10;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    let shortCode: string;
    
    if (useMemorable) {
      // 70% chance for memorable, 30% for professional
      shortCode = Math.random() < 0.7 ? generateMemorableCode() : generateProfessionalCode();
    } else {
      // 50% chance for each type
      shortCode = Math.random() < 0.5 ? generateShortCode(6) : generateProfessionalCode();
    }
    
    // Check if code already exists
    const existing = await db.collection(collection).findOne({ 
      shortCode,
      isActive: true 
    });
    
    if (!existing) {
      return shortCode;
    }
    
    attempts++;
  }
  
  // Fallback to random code with timestamp
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${random}`.substring(0, 8);
}

/**
 * Calculate comprehensive URL statistics
 * @param urls - Array of shortened URLs
 * @returns UrlStats object
 */
export function calculateUrlStats(urls: ShortenedUrl[]): UrlStats {
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const activeUrls = urls.filter(url => !isUrlExpired(url)).length;
  const expiredUrls = urls.filter(url => isUrlExpired(url)).length;
  const averageClicks = totalUrls > 0 ? Math.round(totalClicks / totalUrls) : 0;
  
  // Top performing URLs (top 5 by clicks)
  const topPerformingUrls = urls
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);
  
  // Recent activity (last 10 clicks)
  const allClickEvents = urls
    .flatMap(url => url.clickHistory || [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
  
  // Health status summary
  const healthStatus = {
    ok: urls.filter(url => url.healthStatus === 'ok').length,
    broken: urls.filter(url => url.healthStatus === 'broken').length,
    unknown: urls.filter(url => url.healthStatus === 'unknown' || !url.healthStatus).length
  };
  
  return {
    totalUrls,
    totalClicks,
    activeUrls,
    expiredUrls,
    averageClicks,
    topPerformingUrls,
    recentActivity: allClickEvents,
    healthStatus
  };
}

/**
 * Sanitize and validate create URL request
 * @param request - CreateUrlRequest object
 * @returns Sanitized CreateUrlRequest
 */
export function sanitizeCreateUrlRequest(request: CreateUrlRequest): CreateUrlRequest {
  const sanitized: CreateUrlRequest = {
    originalUrl: request.originalUrl?.trim() || '',
    customAlias: request.customAlias?.trim() || undefined,
    expiresInDays: request.expiresInDays,
    expiresAt: request.expiresAt?.trim() || undefined,
    userId: request.userId?.trim() || undefined,
    tags: request.tags?.filter(tag => tag?.trim()).map(tag => tag.trim()) || undefined,
    description: request.description?.trim() || undefined,
    anonymousUserId: request.anonymousUserId?.trim() || undefined,
    deviceFingerprint: request.deviceFingerprint?.trim() || undefined,
    ipAddress: request.ipAddress?.trim() || undefined
  };
  
  // Validate tags
  if (sanitized.tags && sanitized.tags.length > 10) {
    throw new Error('Maximum 10 tags allowed');
  }
  
  // Validate description length
  if (sanitized.description && sanitized.description.length > 200) {
    throw new Error('Description must be 200 characters or less');
  }
  
  return sanitized;
}

/**
 * Extract domain from URL for categorization
 * @param url - URL to extract domain from
 * @returns Domain string
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

/**
 * Generate click event from request data
 * @param userAgent - User agent string
 * @param referrer - Referrer URL
 * @param ip - IP address
 * @returns ClickEvent object
 */
export function generateClickEvent(
  userAgent?: string,
  referrer?: string,
  ip?: string
): ClickEvent {
  const device = userAgent?.includes('Mobile') ? 'mobile' : 
                 userAgent?.includes('Tablet') ? 'tablet' : 'desktop';
  
  return {
    timestamp: new Date(),
    userAgent,
    referrer,
    ip,
    device
  };
} 