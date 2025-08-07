import mongoose from 'mongoose';
import { UrlShortenerModel } from '@/models/UrlShortenerModel';
import { createHash } from 'crypto';

export interface CreateShortUrlRequest {
  originalUrl: string;
  customSlug?: string;
  title?: string;
  description?: string;
  tags?: string[];
  expiresAt?: Date;
  maxClicks?: number;
  isPublic?: boolean;
  userId?: string;
}

export interface ShortUrlResponse {
  shortCode: string;
  originalUrl: string;
  shortUrl: string;
  title?: string;
  description?: string;
  tags?: string[];
  expiresAt?: Date;
  maxClicks?: number;
  isPublic: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UrlStats {
  totalClicks: number;
  uniqueClicks: number;
  lastClickedAt?: Date;
  clickHistory: ClickRecord[];
  referrers: ReferrerStats[];
  countries: CountryStats[];
  devices: DeviceStats[];
  browsers: BrowserStats[];
}

export interface ClickRecord {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
}

export interface ReferrerStats {
  referrer: string;
  clicks: number;
  percentage: number;
}

export interface CountryStats {
  country: string;
  clicks: number;
  percentage: number;
}

export interface DeviceStats {
  device: string;
  clicks: number;
  percentage: number;
}

export interface BrowserStats {
  browser: string;
  clicks: number;
  percentage: number;
}

export class UrlShortenerService {
  private static instance: UrlShortenerService;

  private constructor() {}

  public static getInstance(): UrlShortenerService {
    if (!UrlShortenerService.instance) {
      UrlShortenerService.instance = new UrlShortenerService();
    }
    return UrlShortenerService.instance;
  }

  /**
   * Generate a short code for the URL
   */
  private generateShortCode(originalUrl: string, customSlug?: string): string {
    if (customSlug) {
      return customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }

    // Generate hash from URL and timestamp
    const hash = createHash('md5')
      .update(originalUrl + Date.now().toString())
      .digest('hex');

    // Take first 8 characters
    return hash.substring(0, 8);
  }

  /**
   * Validate URL format
   */
  private validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if short code is available
   */
  private async isShortCodeAvailable(shortCode: string): Promise<boolean> {
    const existing = await UrlShortenerModel.findOne({ shortCode });
    return !existing;
  }

  /**
   * Create a new short URL
   */
  public async createShortUrl(request: CreateShortUrlRequest): Promise<ShortUrlResponse> {
    try {
      // Validate URL
      if (!this.validateUrl(request.originalUrl)) {
        throw new Error('Invalid URL format');
      }

      // Generate short code
      let shortCode = this.generateShortCode(request.originalUrl, request.customSlug);
      
      // Check if custom slug is available
      if (request.customSlug) {
        const isAvailable = await this.isShortCodeAvailable(shortCode);
        if (!isAvailable) {
          throw new Error('Custom slug is already taken');
        }
      } else {
        // Generate unique short code
        let attempts = 0;
        while (!(await this.isShortCodeAvailable(shortCode)) && attempts < 10) {
          shortCode = this.generateShortCode(request.originalUrl);
          attempts++;
        }
        
        if (attempts >= 10) {
          throw new Error('Unable to generate unique short code');
        }
      }

      // Create short URL document
      const shortUrl = new UrlShortenerModel({
        shortCode,
        originalUrl: request.originalUrl,
        title: request.title,
        description: request.description,
        tags: request.tags || [],
        expiresAt: request.expiresAt,
        maxClicks: request.maxClicks,
        isPublic: request.isPublic ?? true,
        userId: request.userId,
        clicks: 0,
        uniqueClicks: 0,
        clickHistory: [],
        referrers: [],
        countries: [],
        devices: [],
        browsers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await shortUrl.save();

      return {
        shortCode,
        originalUrl: request.originalUrl,
        shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${shortCode}`,
        title: request.title,
        description: request.description,
        tags: request.tags,
        expiresAt: request.expiresAt,
        maxClicks: request.maxClicks,
        isPublic: request.isPublic ?? true,
        userId: request.userId,
        createdAt: shortUrl.createdAt,
        updatedAt: shortUrl.updatedAt
      };
    } catch (error) {
      console.error('Error creating short URL:', error);
      throw error;
    }
  }

  /**
   * Get original URL by short code
   */
  public async getOriginalUrl(shortCode: string, clickData?: {
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    country?: string;
    city?: string;
    device?: string;
    browser?: string;
    os?: string;
  }): Promise<string | null> {
    try {
      const shortUrl = await UrlShortenerModel.findOne({ shortCode });

      if (!shortUrl) {
        return null;
      }

      // Check if URL is expired
      if (shortUrl.expiresAt && new Date() > shortUrl.expiresAt) {
        throw new Error('URL has expired');
      }

      // Check if max clicks reached
      if (shortUrl.maxClicks && shortUrl.clicks >= shortUrl.maxClicks) {
        throw new Error('Maximum clicks reached');
      }

      // Record click if click data provided
      if (clickData) {
        await this.recordClick(shortCode, clickData);
      }

      return shortUrl.originalUrl;
    } catch (error) {
      console.error('Error getting original URL:', error);
      throw error;
    }
  }

  /**
   * Record a click on the short URL
   */
  private async recordClick(shortCode: string, clickData: {
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    country?: string;
    city?: string;
    device?: string;
    browser?: string;
    os?: string;
  }): Promise<void> {
    try {
      const shortUrl = await UrlShortenerModel.findOne({ shortCode });
      
      if (!shortUrl) {
        return;
      }

      // Add click record
      const clickRecord: ClickRecord = {
        timestamp: new Date(),
        ipAddress: clickData.ipAddress,
        userAgent: clickData.userAgent,
        referrer: clickData.referrer,
        country: clickData.country,
        city: clickData.city,
        device: clickData.device,
        browser: clickData.browser,
        os: clickData.os
      };

      shortUrl.clickHistory.push(clickRecord);
      shortUrl.clicks += 1;

      // Update unique clicks (simplified - just count unique IPs)
      const uniqueIPs = new Set(shortUrl.clickHistory.map(click => click.ipAddress));
      shortUrl.uniqueClicks = uniqueIPs.size;

      // Update referrer stats
      if (clickData.referrer) {
        const existingReferrer = shortUrl.referrers.find(r => r.referrer === clickData.referrer);
        if (existingReferrer) {
          existingReferrer.clicks += 1;
        } else {
          shortUrl.referrers.push({
            referrer: clickData.referrer,
            clicks: 1,
            percentage: 0
          });
        }
      }

      // Update country stats
      if (clickData.country) {
        const existingCountry = shortUrl.countries.find(c => c.country === clickData.country);
        if (existingCountry) {
          existingCountry.clicks += 1;
        } else {
          shortUrl.countries.push({
            country: clickData.country,
            clicks: 1,
            percentage: 0
          });
        }
      }

      // Update device stats
      if (clickData.device) {
        const existingDevice = shortUrl.devices.find(d => d.device === clickData.device);
        if (existingDevice) {
          existingDevice.clicks += 1;
        } else {
          shortUrl.devices.push({
            device: clickData.device,
            clicks: 1,
            percentage: 0
          });
        }
      }

      // Update browser stats
      if (clickData.browser) {
        const existingBrowser = shortUrl.browsers.find(b => b.browser === clickData.browser);
        if (existingBrowser) {
          existingBrowser.clicks += 1;
        } else {
          shortUrl.browsers.push({
            browser: clickData.browser,
            clicks: 1,
            percentage: 0
          });
        }
      }

      // Calculate percentages
      shortUrl.referrers.forEach(r => r.percentage = (r.clicks / shortUrl.clicks) * 100);
      shortUrl.countries.forEach(c => c.percentage = (c.clicks / shortUrl.clicks) * 100);
      shortUrl.devices.forEach(d => d.percentage = (d.clicks / shortUrl.clicks) * 100);
      shortUrl.browsers.forEach(b => b.percentage = (b.clicks / shortUrl.clicks) * 100);

      shortUrl.lastClickedAt = new Date();
      shortUrl.updatedAt = new Date();

      await shortUrl.save();
    } catch (error) {
      console.error('Error recording click:', error);
    }
  }

  /**
   * Get URL statistics
   */
  public async getUrlStats(shortCode: string): Promise<UrlStats | null> {
    try {
      const shortUrl = await UrlShortenerModel.findOne({ shortCode });

      if (!shortUrl) {
        return null;
      }

      return {
        totalClicks: shortUrl.clicks,
        uniqueClicks: shortUrl.uniqueClicks,
        lastClickedAt: shortUrl.lastClickedAt,
        clickHistory: shortUrl.clickHistory,
        referrers: shortUrl.referrers,
        countries: shortUrl.countries,
        devices: shortUrl.devices,
        browsers: shortUrl.browsers
      };
    } catch (error) {
      console.error('Error getting URL stats:', error);
      return null;
    }
  }

  /**
   * Get user's short URLs
   */
  public async getUserUrls(userId: string, page: number = 1, limit: number = 10): Promise<{
    urls: ShortUrlResponse[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [urls, total] = await Promise.all([
        UrlShortenerModel.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        UrlShortenerModel.countDocuments({ userId })
      ]);

      const shortUrlResponses: ShortUrlResponse[] = urls.map(url => ({
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${url.shortCode}`,
        title: url.title,
        description: url.description,
        tags: url.tags,
        expiresAt: url.expiresAt,
        maxClicks: url.maxClicks,
        isPublic: url.isPublic,
        userId: url.userId,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt
      }));

      return {
        urls: shortUrlResponses,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting user URLs:', error);
      return {
        urls: [],
        total: 0,
        page,
        pages: 0
      };
    }
  }

  /**
   * Delete a short URL
   */
  public async deleteShortUrl(shortCode: string, userId?: string): Promise<boolean> {
    try {
      const query: any = { shortCode };
      if (userId) {
        query.userId = userId;
      }

      const result = await UrlShortenerModel.deleteOne(query);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting short URL:', error);
      return false;
    }
  }

  /**
   * Update a short URL
   */
  public async updateShortUrl(shortCode: string, updates: Partial<ShortUrlResponse>, userId?: string): Promise<ShortUrlResponse | null> {
    try {
      const query: any = { shortCode };
      if (userId) {
        query.userId = userId;
      }

      const shortUrl = await UrlShortenerModel.findOneAndUpdate(
        query,
        { $set: { ...updates, updatedAt: new Date() } },
        { new: true }
      );

      if (!shortUrl) {
        return null;
      }

      return {
        shortCode: shortUrl.shortCode,
        originalUrl: shortUrl.originalUrl,
        shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${shortUrl.shortCode}`,
        title: shortUrl.title,
        description: shortUrl.description,
        tags: shortUrl.tags,
        expiresAt: shortUrl.expiresAt,
        maxClicks: shortUrl.maxClicks,
        isPublic: shortUrl.isPublic,
        userId: shortUrl.userId,
        createdAt: shortUrl.createdAt,
        updatedAt: shortUrl.updatedAt
      };
    } catch (error) {
      console.error('Error updating short URL:', error);
      return null;
    }
  }
}

// Export singleton instance
export const urlShortenerService = UrlShortenerService.getInstance(); 