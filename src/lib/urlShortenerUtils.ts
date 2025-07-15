import { ObjectId } from 'mongodb';

export interface ShortenedUrl {
  _id?: ObjectId;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  clicks: number;
  createdAt: Date;
  expiresAt?: Date;
  userId?: string;
  isActive: boolean;
}

export interface CreateUrlRequest {
  originalUrl: string;
  customAlias?: string;
  expiresInDays?: number;
  userId?: string;
}

export interface UrlStats {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  expiredUrls: number;
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
  
  const trimmedAlias = alias.trim();
  if (trimmedAlias.length < 3 || trimmedAlias.length > 20) {
    return false;
  }
  
  // Allow letters, numbers, hyphens, and underscores, 3-20 characters
  const aliasRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return aliasRegex.test(trimmedAlias);
}

/**
 * Generate expiration date based on days from now
 * @param days - Number of days from now
 * @returns Date object
 */
export function generateExpirationDate(days: number): Date {
  if (days < 1 || days > 3650) { // Max 10 years
    throw new Error('Expiration days must be between 1 and 3650');
  }
  
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Check if a URL has expired
 * @param url - ShortenedUrl object
 * @returns True if expired, false otherwise
 */
export function isUrlExpired(url: ShortenedUrl): boolean {
  if (!url || !url.expiresAt) {
    return false;
  }
  
  try {
    const expirationDate = new Date(url.expiresAt);
    return new Date() > expirationDate;
  } catch {
    return false;
  }
}

/**
 * Generate a unique short code that doesn't exist in the database
 * @param db - MongoDB database instance
 * @param collection - Collection name
 * @param useMemorable - Whether to use memorable codes
 * @returns Unique short code
 */
export async function generateUniqueShortCode(
  db: any,
  collection: string,
  useMemorable: boolean = false
): Promise<string> {
  if (!db || !collection) {
    throw new Error('Database and collection are required');
  }
  
  let attempts = 0;
  const maxAttempts = 20; // Increased from 10 to handle more collisions
  
  while (attempts < maxAttempts) {
    const shortCode = useMemorable ? generateMemorableCode() : generateShortCode();
    
    try {
      const existing = await db.collection(collection).findOne({ shortCode });
      if (!existing) {
        return shortCode;
      }
    } catch (error) {
      console.error('Error checking for existing short code:', error);
      // Continue trying even if there's a database error
    }
    
    attempts++;
  }
  
  // If we can't find a unique code, append a timestamp
  const timestamp = Date.now().toString(36);
  return generateShortCode(4) + timestamp;
}

/**
 * Calculate URL statistics
 * @param urls - Array of shortened URLs
 * @returns Statistics object
 */
export function calculateUrlStats(urls: ShortenedUrl[]): UrlStats {
  if (!Array.isArray(urls)) {
    return {
      totalUrls: 0,
      totalClicks: 0,
      activeUrls: 0,
      expiredUrls: 0
    };
  }
  
  const now = new Date();
  
  return {
    totalUrls: urls.length,
    totalClicks: urls.reduce((sum, url) => sum + (url.clicks || 0), 0),
    activeUrls: urls.filter(url => url.isActive && (!url.expiresAt || new Date(url.expiresAt) > now)).length,
    expiredUrls: urls.filter(url => url.expiresAt && new Date(url.expiresAt) <= now).length
  };
}

/**
 * Sanitize and validate input for URL creation
 * @param request - CreateUrlRequest object
 * @returns Sanitized request object
 */
export function sanitizeCreateUrlRequest(request: CreateUrlRequest): CreateUrlRequest {
  const sanitized: CreateUrlRequest = {
    originalUrl: request.originalUrl?.trim() || '',
    customAlias: request.customAlias?.trim() || undefined,
    expiresInDays: request.expiresInDays || undefined,
    userId: request.userId?.trim() || undefined
  };
  
  // Validate expiration days
  if (sanitized.expiresInDays !== undefined) {
    if (sanitized.expiresInDays < 1 || sanitized.expiresInDays > 3650) {
      throw new Error('Expiration days must be between 1 and 3650');
    }
  }
  
  return sanitized;
} 