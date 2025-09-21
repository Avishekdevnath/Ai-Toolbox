import { ObjectId } from 'mongodb';

export interface ShortenedUrl {
  _id?: ObjectId;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  userId?: string;
  userEmail?: string; // For quick reference
  anonymousUserId?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  tags?: string[];
  description?: string;
  healthStatus?: 'unknown' | 'ok' | 'broken';
  lastCheckedAt?: Date;
  clickHistory?: ClickEvent[];
  // User quota tracking
  userQuota?: {
    maxUrls: number;
    usedUrls: number;
    resetDate: Date;
  };
}

export interface CreateUrlRequest {
  originalUrl: string;
  customAlias?: string;
  expiresInDays?: number;
  expiresAt?: string;
  userId?: string;
  anonymousUserId?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  tags?: string[];
  description?: string;
}

export interface ClickEvent {
  timestamp: Date;
  ip: string;
  userAgent: string;
  referer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
}

export interface UrlStats {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  expiredUrls: number;
  averageClicks: number;
  topPerformingUrls: {
    shortCode: string;
    originalUrl: string;
    clicks: number;
    createdAt: Date;
  }[];
  recentActivity: {
    date: string;
    clicks: number;
    newUrls: number;
  }[];
  healthStatus: {
    ok: number;
    broken: number;
    unknown: number;
  };
}

export interface AnonymousUserSession {
  id: string;
  deviceFingerprint: string;
  createdAt: Date;
  lastActive: Date;
  urlsCreated: number;
}

export interface UrlAnalytics {
  urlId: string;
  shortCode: string;
  totalClicks: number;
  uniqueClicks: number;
  clickRate: number;
  topReferrers: {
    referer: string;
    clicks: number;
  }[];
  geographicData: {
    country: string;
    clicks: number;
  }[];
  deviceData: {
    device: string;
    clicks: number;
  }[];
  browserData: {
    browser: string;
    clicks: number;
  }[];
  timeSeriesData: {
    date: string;
    clicks: number;
  }[];
}

// Validation constants
export const RESERVED_PATHS = [
  'api', 'admin', 'auth', 'dashboard', 'tools', 'about', 'contact', 
  'privacy', 'terms', 'login', 'signup', 'signin', 'logout', 'profile',
  'settings', 'help', 'support', 'docs', 'blog', 'news', 'r', 's'
];

export const MAX_CUSTOM_ALIAS_LENGTH = 50;
export const MIN_CUSTOM_ALIAS_LENGTH = 3;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_TAGS_COUNT = 10;
export const MAX_TAG_LENGTH = 20;

// Utility functions
export function isValidCustomAlias(alias: string): boolean {
  if (!alias) return false;
  
  // Check length
  if (alias.length < MIN_CUSTOM_ALIAS_LENGTH || alias.length > MAX_CUSTOM_ALIAS_LENGTH) {
    return false;
  }
  
  // Check if reserved
  if (RESERVED_PATHS.includes(alias.toLowerCase())) {
    return false;
  }
  
  // Check format (alphanumeric and hyphens only)
  const validFormat = /^[a-zA-Z0-9-]+$/;
  if (!validFormat.test(alias)) {
    return false;
  }
  
  return true;
}

export function generateProfessionalCode(): string {
  const adjectives = [
    'smart', 'quick', 'fast', 'easy', 'best', 'top', 'pro', 'premium',
    'elite', 'prime', 'core', 'base', 'main', 'key', 'vital', 'essential'
  ];
  
  const nouns = [
    'link', 'url', 'web', 'site', 'page', 'tool', 'app', 'service',
    'hub', 'center', 'portal', 'gate', 'way', 'path', 'route', 'bridge'
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'unknown';
  }
}

export function isAnonymousUser(userId?: string): boolean {
  return !userId || userId.startsWith('anon_');
}

export function getUserIdentifier(userId?: string, anonymousUserId?: string): string {
  return userId || anonymousUserId || 'unknown';
}

// Basic Database Operations
import { getDatabase } from '@/lib/mongodb';

export class UrlShortenerSchema {
  private static collectionName = 'shortened_urls';

  static async findByShortCode(shortCode: string): Promise<ShortenedUrl | null> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName).findOne({
      shortCode,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }) as Promise<ShortenedUrl | null>;
  }

  static async incrementClicks(id: string, clickEvent: ClickEvent): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { clicks: 1 },
        $set: { updatedAt: new Date() },
        $push: { clickHistory: clickEvent }
      }
    );

    return result.modifiedCount > 0;
  }

  static async findByUser(userId: string, anonymousUserId?: string): Promise<ShortenedUrl[]> {
    const db = await getDatabase();
    
    const query: any = {
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (userId) {
      query.userId = userId;
    } else if (anonymousUserId) {
      query.anonymousUserId = anonymousUserId;
    } else {
      return [];
    }

    return db.collection(this.collectionName)
      .find(query)
      .sort({ createdAt: -1 })
      .toArray() as Promise<ShortenedUrl[]>;
  }
} 