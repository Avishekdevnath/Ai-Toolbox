import { getDatabase } from '@/lib/mongodb';
import { 
  QRCode, 
  CreateQRCodeRequest, 
  QRCodeStats, 
  UpdateQRCodeRequest,
  QRCodeSearchFilters,
  generateQRCodeContent,
  QRCodeAnalytics
} from '@/schemas/qrCodeSchema';
import QRCodeLib from 'qrcode';

export class QRCodeModel {
  private static collectionName = 'qr_codes';

  static async create(qrData: CreateQRCodeRequest, userId: string, anonymousUserId?: string, deviceFingerprint?: string, ipAddress?: string): Promise<QRCode> {
    const db = await getDatabase();
    
    // Generate QR code content based on type
    const content = generateQRCodeContent(qrData);
    
    // Generate QR code data URL
    const qrCodeDataUrl = await QRCodeLib.toDataURL(content, {
      width: qrData.size,
      margin: qrData.margin,
      color: {
        dark: qrData.foregroundColor,
        light: qrData.backgroundColor
      },
      errorCorrectionLevel: qrData.errorCorrectionLevel
    });

    const qrCode: QRCode = {
      content,
      type: qrData.type,
      title: qrData.title,
      description: qrData.description,
      size: qrData.size,
      foregroundColor: qrData.foregroundColor,
      backgroundColor: qrData.backgroundColor,
      errorCorrectionLevel: qrData.errorCorrectionLevel,
      margin: qrData.margin,
      qrCodeDataUrl,
      userId,
      anonymousUserId,
      deviceFingerprint,
      ipAddress,
      status: 'active',
      isPublic: qrData.isPublic,
      tags: qrData.tags || [],
      expiresAt: qrData.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      analytics: {
        totalScans: 0,
        totalDownloads: 0,
        totalShares: 0,
        scanHistory: [],
        downloadHistory: [],
        shareHistory: []
      },
      // Additional fields for specific QR types
      ssid: qrData.ssid,
      password: qrData.password,
      security: qrData.security,
      hidden: qrData.hidden,
      firstName: qrData.firstName,
      lastName: qrData.lastName,
      organization: qrData.organization,
      title: qrData.title,
      phone: qrData.phone,
      email: qrData.email,
      website: qrData.website,
      address: qrData.address,
      latitude: qrData.latitude,
      longitude: qrData.longitude,
      eventTitle: qrData.eventTitle,
      startDate: qrData.startDate,
      endDate: qrData.endDate,
      location: qrData.location
    };

    const result = await db.collection(this.collectionName).insertOne(qrCode);
    return { ...qrCode, _id: result.insertedId.toString() };
  }

  static async findById(id: string): Promise<QRCode | null> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    return db.collection(this.collectionName).findOne({ 
      _id: new ObjectId(id) 
    }) as Promise<QRCode | null>;
  }

  static async findByUser(userId: string, anonymousUserId?: string, filters?: QRCodeSearchFilters): Promise<{ qrCodes: QRCode[], total: number }> {
    const db = await getDatabase();
    
    const query: any = {
      $or: [
        { userId: userId },
        ...(anonymousUserId ? [{ anonymousUserId: anonymousUserId }] : [])
      ]
    };

    // Apply filters
    if (filters) {
      if (filters.query) {
        query.$and = [
          {
            $or: [
              { title: { $regex: filters.query, $options: 'i' } },
              { content: { $regex: filters.query, $options: 'i' } },
              { description: { $regex: filters.query, $options: 'i' } },
              { tags: { $in: [new RegExp(filters.query, 'i')] } }
            ]
          }
        ];
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          query.createdAt.$lte = filters.dateTo;
        }
      }
    }

    const sortOptions: any = {};
    sortOptions[filters?.sortBy || 'createdAt'] = filters?.sortOrder === 'asc' ? 1 : -1;

    const qrCodes = await db.collection(this.collectionName)
      .find(query)
      .sort(sortOptions)
      .skip(filters?.offset || 0)
      .limit(filters?.limit || 20)
      .toArray() as QRCode[];

    const total = await db.collection(this.collectionName).countDocuments(query);

    return { qrCodes, total };
  }

  static async update(id: string, updateData: UpdateQRCodeRequest): Promise<boolean> {
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

  static async trackScan(id: string, scanData: {
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    city?: string;
    device?: string;
    referer?: string;
  }): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const scanEvent = {
      timestamp: new Date(),
      ...scanData
    };

    const result = await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { 'analytics.totalScans': 1 },
        $set: { 
          'analytics.lastScannedAt': new Date(),
          updatedAt: new Date()
        },
        $push: { 'analytics.scanHistory': scanEvent }
      }
    );

    return result.modifiedCount > 0;
  }

  static async trackDownload(id: string, downloadData: {
    ipAddress?: string;
    userAgent?: string;
    format?: string;
  }): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const downloadEvent = {
      timestamp: new Date(),
      ...downloadData
    };

    const result = await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { 'analytics.totalDownloads': 1 },
        $set: { 
          'analytics.lastDownloadedAt': new Date(),
          updatedAt: new Date()
        },
        $push: { 'analytics.downloadHistory': downloadEvent }
      }
    );

    return result.modifiedCount > 0;
  }

  static async trackShare(id: string, shareData: {
    platform?: string;
    method?: string;
  }): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const shareEvent = {
      timestamp: new Date(),
      ...shareData
    };

    const result = await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { 'analytics.totalShares': 1 },
        $set: { 
          'analytics.lastSharedAt': new Date(),
          updatedAt: new Date()
        },
        $push: { 'analytics.shareHistory': shareEvent }
      }
    );

    return result.modifiedCount > 0;
  }

  static async getStats(userId?: string, anonymousUserId?: string): Promise<QRCodeStats> {
    const db = await getDatabase();
    
    const query: any = {};
    if (userId) {
      query.userId = userId;
    } else if (anonymousUserId) {
      query.anonymousUserId = anonymousUserId;
    } else {
      return {
        totalQRCodes: 0,
        totalScans: 0,
        totalDownloads: 0,
        totalShares: 0,
        activeQRCodes: 0,
        expiredQRCodes: 0,
        averageScansPerCode: 0,
        topPerformingQRCodes: [],
        recentActivity: [],
        typeDistribution: {},
        scanTrends: []
      };
    }

    const qrCodes = await db.collection(this.collectionName)
      .find(query)
      .toArray() as QRCode[];

    const now = new Date();
    const activeQRCodes = qrCodes.filter(qr => qr.status === 'active' && (!qr.expiresAt || qr.expiresAt > now));
    const expiredQRCodes = qrCodes.filter(qr => qr.status === 'expired' || (qr.expiresAt && qr.expiresAt <= now));

    const totalScans = qrCodes.reduce((sum, qr) => sum + qr.analytics.totalScans, 0);
    const totalDownloads = qrCodes.reduce((sum, qr) => sum + qr.analytics.totalDownloads, 0);
    const totalShares = qrCodes.reduce((sum, qr) => sum + qr.analytics.totalShares, 0);
    const averageScansPerCode = qrCodes.length > 0 ? totalScans / qrCodes.length : 0;

    const topPerformingQRCodes = qrCodes
      .sort((a, b) => (b.analytics.totalScans + b.analytics.totalDownloads + b.analytics.totalShares) - 
                     (a.analytics.totalScans + a.analytics.totalDownloads + a.analytics.totalShares))
      .slice(0, 5)
      .map(qr => ({
        id: qr._id!,
        title: qr.title || 'Untitled',
        content: qr.content,
        scans: qr.analytics.totalScans,
        downloads: qr.analytics.totalDownloads,
        shares: qr.analytics.totalShares,
        createdAt: qr.createdAt
      }));

    // Generate recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayQRCodes = qrCodes.filter(qr => {
        const qrDate = qr.createdAt.toISOString().split('T')[0];
        return qrDate === dateStr;
      });
      
      const dayScans = dayQRCodes.reduce((sum, qr) => sum + qr.analytics.totalScans, 0);
      const dayDownloads = dayQRCodes.reduce((sum, qr) => sum + qr.analytics.totalDownloads, 0);
      const dayShares = dayQRCodes.reduce((sum, qr) => sum + qr.analytics.totalShares, 0);
      
      recentActivity.push({
        date: dateStr,
        scans: dayScans,
        downloads: dayDownloads,
        shares: dayShares,
        newQRCodes: dayQRCodes.length
      });
    }

    // Type distribution
    const typeDistribution: Record<string, number> = {};
    qrCodes.forEach(qr => {
      typeDistribution[qr.type] = (typeDistribution[qr.type] || 0) + 1;
    });

    // Scan trends (last 30 days)
    const scanTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayScans = qrCodes.reduce((sum, qr) => {
        const dayScanHistory = qr.analytics.scanHistory.filter(scan => 
          scan.timestamp.toISOString().split('T')[0] === dateStr
        );
        return sum + dayScanHistory.length;
      }, 0);
      
      scanTrends.push({
        date: dateStr,
        scans: dayScans
      });
    }

    return {
      totalQRCodes: qrCodes.length,
      totalScans,
      totalDownloads,
      totalShares,
      activeQRCodes: activeQRCodes.length,
      expiredQRCodes: expiredQRCodes.length,
      averageScansPerCode,
      topPerformingQRCodes,
      recentActivity,
      typeDistribution,
      scanTrends
    };
  }

  static async getAnalytics(id: string): Promise<any> {
    const qrCode = await this.findById(id);
    if (!qrCode) return null;

    const scanHistory = qrCode.analytics.scanHistory || [];
    const downloadHistory = qrCode.analytics.downloadHistory || [];
    const shareHistory = qrCode.analytics.shareHistory || [];

    // Analyze scan patterns
    const hourlyScans = new Array(24).fill(0);
    const dailyScans = new Array(7).fill(0);
    const countries: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const referrers: Record<string, number> = {};

    scanHistory.forEach(scan => {
      const hour = new Date(scan.timestamp).getHours();
      const day = new Date(scan.timestamp).getDay();
      
      hourlyScans[hour]++;
      dailyScans[day]++;
      
      if (scan.country) {
        countries[scan.country] = (countries[scan.country] || 0) + 1;
      }
      
      if (scan.device) {
        devices[scan.device] = (devices[scan.device] || 0) + 1;
      }
      
      if (scan.referer) {
        referrers[scan.referer] = (referrers[scan.referer] || 0) + 1;
      }
    });

    // Download format distribution
    const downloadFormats: Record<string, number> = {};
    downloadHistory.forEach(download => {
      const format = download.format || 'png';
      downloadFormats[format] = (downloadFormats[format] || 0) + 1;
    });

    // Share platform distribution
    const sharePlatforms: Record<string, number> = {};
    shareHistory.forEach(share => {
      const platform = share.platform || 'unknown';
      sharePlatforms[platform] = (sharePlatforms[platform] || 0) + 1;
    });

    return {
      qrCodeId: id,
      title: qrCode.title || 'Untitled',
      type: qrCode.type,
      totalScans: qrCode.analytics.totalScans,
      totalDownloads: qrCode.analytics.totalDownloads,
      totalShares: qrCode.analytics.totalShares,
      uniqueScans: scanHistory.length,
      uniqueDownloads: downloadHistory.length,
      uniqueShares: shareHistory.length,
      scanRate: qrCode.analytics.totalScans / Math.max(1, Math.floor((Date.now() - qrCode.createdAt.getTime()) / (1000 * 60 * 60 * 24))),
      hourlyScans,
      dailyScans,
      topCountries: Object.entries(countries)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([country, scans]) => ({ country, scans })),
      deviceData: Object.entries(devices)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([device, scans]) => ({ device, scans })),
      topReferrers: Object.entries(referrers)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([referer, scans]) => ({ referer, scans })),
      downloadFormats: Object.entries(downloadFormats)
        .sort(([,a], [,b]) => b - a)
        .map(([format, count]) => ({ format, count })),
      sharePlatforms: Object.entries(sharePlatforms)
        .sort(([,a], [,b]) => b - a)
        .map(([platform, count]) => ({ platform, count }))
    };
  }

  static async search(query: string, userId?: string, limit: number = 10): Promise<QRCode[]> {
    const db = await getDatabase();
    
    const searchQuery: any = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
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
      .toArray() as Promise<QRCode[]>;
  }

  static async getPublicQRCodes(limit: number = 20): Promise<QRCode[]> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName)
      .find({ 
        isPublic: true,
        status: 'active',
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      })
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray() as Promise<QRCode[]>;
  }
}
