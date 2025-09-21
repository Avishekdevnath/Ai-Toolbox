import { getDatabase } from '@/lib/mongodb';
import { 
  ShortenedUrl, 
  CreateUrlRequest, 
  UrlStats, 
  ClickEvent,
  generateProfessionalCode,
  isValidCustomAlias,
  extractDomain
} from '@/schemas/urlShortenerSchema';

export class UrlShortenerModel {
  private static collectionName = 'shortened_urls';

  static async create(urlData: CreateUrlRequest): Promise<ShortenedUrl> {
    const db = await getDatabase();
    
    // Generate short code if not provided
    const shortCode = urlData.customAlias || generateProfessionalCode();
    
    // Validate custom alias if provided
    if (urlData.customAlias && !isValidCustomAlias(urlData.customAlias)) {
      throw new Error('Invalid custom alias');
    }

    // Check if short code already exists
    const existing = await this.findByShortCode(shortCode);
    if (existing) {
      throw new Error('Short code already exists');
    }

    // Calculate expiration date
    let expiresAt: Date | undefined;
    if (urlData.expiresAt) {
      expiresAt = new Date(urlData.expiresAt);
    } else if (urlData.expiresInDays) {
      expiresAt = new Date(Date.now() + urlData.expiresInDays * 24 * 60 * 60 * 1000);
    }

    const shortenedUrl: ShortenedUrl = {
      originalUrl: urlData.originalUrl,
      shortCode,
      customAlias: urlData.customAlias,
      userId: urlData.userId,
      anonymousUserId: urlData.anonymousUserId,
      deviceFingerprint: urlData.deviceFingerprint,
      ipAddress: urlData.ipAddress,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt,
      isActive: true,
      tags: urlData.tags || [],
      description: urlData.description,
      healthStatus: 'unknown',
      clickHistory: []
    };

    const result = await db.collection(this.collectionName).insertOne(shortenedUrl);
    return { ...shortenedUrl, _id: result.insertedId };
  }

  static async findByShortCode(shortCode: string): Promise<ShortenedUrl | null> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName).findOne({
      shortCode,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }) as Promise<ShortenedUrl | null>;
  }

  static async findById(id: string): Promise<ShortenedUrl | null> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    return db.collection(this.collectionName).findOne({ 
      _id: new ObjectId(id) 
    }) as Promise<ShortenedUrl | null>;
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

  static async update(id: string, updateData: Partial<ShortenedUrl>): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection(this.collectionName).deleteOne({ 
      _id: new ObjectId(id) 
    });

    return result.deletedCount > 0;
  }

  static async getStats(userId?: string, anonymousUserId?: string): Promise<UrlStats> {
    const db = await getDatabase();
    
    const query: any = { isActive: true };
    if (userId) {
      query.userId = userId;
    } else if (anonymousUserId) {
      query.anonymousUserId = anonymousUserId;
    } else {
      return {
        totalUrls: 0,
        totalClicks: 0,
        activeUrls: 0,
        expiredUrls: 0,
        averageClicks: 0,
        topPerformingUrls: [],
        recentActivity: [],
        healthStatus: { ok: 0, broken: 0, unknown: 0 }
      };
    }

    const urls = await db.collection(this.collectionName)
      .find(query)
      .toArray() as ShortenedUrl[];

    const now = new Date();
    const activeUrls = urls.filter(url => !url.expiresAt || url.expiresAt > now);
    const expiredUrls = urls.filter(url => url.expiresAt && url.expiresAt <= now);
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    const averageClicks = urls.length > 0 ? totalClicks / urls.length : 0;

    const topPerformingUrls = urls
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map(url => ({
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
        createdAt: url.createdAt
      }));

    const healthStatus = {
      ok: urls.filter(url => url.healthStatus === 'ok').length,
      broken: urls.filter(url => url.healthStatus === 'broken').length,
      unknown: urls.filter(url => url.healthStatus === 'unknown').length
    };

    // Generate recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayUrls = urls.filter(url => {
        const urlDate = url.createdAt.toISOString().split('T')[0];
        return urlDate === dateStr;
      });
      
      const dayClicks = dayUrls.reduce((sum, url) => sum + url.clicks, 0);
      
      recentActivity.push({
        date: dateStr,
        clicks: dayClicks,
        newUrls: dayUrls.length
      });
    }

    return {
      totalUrls: urls.length,
      totalClicks,
      activeUrls: activeUrls.length,
      expiredUrls: expiredUrls.length,
      averageClicks,
      topPerformingUrls,
      recentActivity,
      healthStatus
    };
  }

  static async checkUrlHealth(url: ShortenedUrl): Promise<'ok' | 'broken'> {
    try {
      const response = await fetch(url.originalUrl, {
        method: 'HEAD',
        timeout: 5000
      });
      return response.ok ? 'ok' : 'broken';
    } catch {
      return 'broken';
    }
  }

  static async updateHealthStatus(id: string, status: 'ok' | 'broken'): Promise<boolean> {
    return this.update(id, {
      healthStatus: status,
      lastCheckedAt: new Date()
    });
  }

  static async trackClick(shortCode: string, clickEvent: ClickEvent): Promise<void> {
    const db = await getDatabase();
    
    await db.collection(this.collectionName).updateOne(
      { shortCode, isActive: true },
      { 
        $inc: { clicks: 1 },
        $push: { clickHistory: clickEvent },
        $set: { updatedAt: new Date() }
      }
    );
  }

  static async search(query: string, userId?: string, limit: number = 10): Promise<ShortenedUrl[]> {
    const db = await getDatabase();
    
    const searchQuery: any = {
      isActive: true,
      $or: [
        { originalUrl: { $regex: query, $options: 'i' } },
        { shortCode: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    if (userId) {
      searchQuery.userId = userId;
    }

    return db.collection(this.collectionName)
      .find(searchQuery)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray() as Promise<ShortenedUrl[]>;
  }

  static async getAnalytics(id: string): Promise<any> {
    const url = await this.findById(id);
    if (!url) return null;

    const domain = extractDomain(url.originalUrl);
    const clickHistory = url.clickHistory || [];

    // Analyze click patterns
    const hourlyClicks = new Array(24).fill(0);
    const dailyClicks = new Array(7).fill(0);
    const referrers: Record<string, number> = {};
    const countries: Record<string, number> = {};
    const devices: Record<string, number> = {};

    clickHistory.forEach(click => {
      const hour = new Date(click.timestamp).getHours();
      const day = new Date(click.timestamp).getDay();
      
      hourlyClicks[hour]++;
      dailyClicks[day]++;
      
      if (click.referer) {
        referrers[click.referer] = (referrers[click.referer] || 0) + 1;
      }
      
      if (click.country) {
        countries[click.country] = (countries[click.country] || 0) + 1;
      }
      
      if (click.device) {
        devices[click.device] = (devices[click.device] || 0) + 1;
      }
    });

    return {
      urlId: id,
      shortCode: url.shortCode,
      totalClicks: url.clicks,
      uniqueClicks: clickHistory.length,
      clickRate: url.clicks / Math.max(1, Math.floor((Date.now() - url.createdAt.getTime()) / (1000 * 60 * 60 * 24))),
      domain,
      hourlyClicks,
      dailyClicks,
      topReferrers: Object.entries(referrers)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([referer, clicks]) => ({ referer, clicks })),
      geographicData: Object.entries(countries)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([country, clicks]) => ({ country, clicks })),
      deviceData: Object.entries(devices)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([device, clicks]) => ({ device, clicks }))
    };
  }
} 