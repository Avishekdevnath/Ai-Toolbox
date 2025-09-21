import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserAuthService } from '@/lib/userAuthService';

const COLLECTION_NAME = 'shortened_urls';

/**
 * GET /api/url-shortener/user/analytics
 * Get user's URL analytics and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check user authentication
    const userSession = await UserAuthService.getUserSession(request);
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y, all

    const db = await getDatabase();

    // Build date filter
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default period filter
      const now = new Date();
      let daysBack = 30;
      
      switch (period) {
        case '7d':
          daysBack = 7;
          break;
        case '30d':
          daysBack = 30;
          break;
        case '90d':
          daysBack = 90;
          break;
        case '1y':
          daysBack = 365;
          break;
        case 'all':
          // No date filter
          break;
        default:
          daysBack = 30;
      }
      
      if (period !== 'all') {
        const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
        dateFilter.createdAt = { $gte: startDate };
      }
    }

    // Base query for user's URLs
    const baseQuery = {
      userId: userSession.id,
      isActive: true,
      ...dateFilter
    };

    // Get basic statistics
    const [
      totalUrls,
      activeUrls,
      expiredUrls,
      totalClicks,
      urlsWithClicks,
      topUrls,
      recentUrls,
      clicksOverTime,
      tagStats
    ] = await Promise.all([
      // Total URLs
      db.collection(COLLECTION_NAME).countDocuments(baseQuery),
      
      // Active URLs (not expired)
      db.collection(COLLECTION_NAME).countDocuments({
        ...baseQuery,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      }),
      
      // Expired URLs
      db.collection(COLLECTION_NAME).countDocuments({
        ...baseQuery,
        expiresAt: { $lte: new Date() }
      }),
      
      // Total clicks
      db.collection(COLLECTION_NAME).aggregate([
        { $match: baseQuery },
        { $group: { _id: null, totalClicks: { $sum: '$clicks' } } }
      ]).toArray(),
      
      // URLs with clicks
      db.collection(COLLECTION_NAME).countDocuments({
        ...baseQuery,
        clicks: { $gt: 0 }
      }),
      
      // Top performing URLs
      db.collection(COLLECTION_NAME).find(baseQuery)
        .sort({ clicks: -1 })
        .limit(10)
        .toArray(),
      
      // Recent URLs
      db.collection(COLLECTION_NAME).find(baseQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
      
      // Clicks over time (daily aggregation)
      db.collection(COLLECTION_NAME).aggregate([
        { $match: baseQuery },
        { $unwind: '$clickHistory' },
        {
          $group: {
            _id: {
              year: { $year: '$clickHistory.timestamp' },
              month: { $month: '$clickHistory.timestamp' },
              day: { $dayOfMonth: '$clickHistory.timestamp' }
            },
            clicks: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 30 }
      ]).toArray(),
      
      // Tag statistics
      db.collection(COLLECTION_NAME).aggregate([
        { $match: baseQuery },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray()
    ]);

    // Process clicks data
    const totalClicksValue = totalClicks[0]?.totalClicks || 0;
    const averageClicks = totalUrls > 0 ? Math.round(totalClicksValue / totalUrls) : 0;

    // Process top URLs
    const processedTopUrls = topUrls.map(url => ({
      ...url,
      shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${url.shortCode}`
    }));

    // Process recent URLs
    const processedRecentUrls = recentUrls.map(url => ({
      ...url,
      shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${url.shortCode}`
    }));

    // Process clicks over time
    const processedClicksOverTime = clicksOverTime.map(item => ({
      date: new Date(item._id.year, item._id.month - 1, item._id.day).toISOString().split('T')[0],
      clicks: item.clicks
    }));

    // Process tag statistics
    const processedTagStats = tagStats.map(item => ({
      tag: item._id,
      count: item.count
    }));

    // Calculate growth metrics (if we have historical data)
    const previousPeriodStart = new Date();
    const currentPeriodStart = new Date();
    
    if (period === '7d') {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
      currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
    } else if (period === '30d') {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
      currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
    }

    const [previousPeriodClicks, currentPeriodClicks] = await Promise.all([
      db.collection(COLLECTION_NAME).aggregate([
        { 
          $match: {
            userId: userSession.id,
            isActive: true,
            createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart }
          }
        },
        { $group: { _id: null, totalClicks: { $sum: '$clicks' } } }
      ]).toArray(),
      
      db.collection(COLLECTION_NAME).aggregate([
        { 
          $match: {
            userId: userSession.id,
            isActive: true,
            createdAt: { $gte: currentPeriodStart }
          }
        },
        { $group: { _id: null, totalClicks: { $sum: '$clicks' } } }
      ]).toArray()
    ]);

    const previousClicks = previousPeriodClicks[0]?.totalClicks || 0;
    const currentClicks = currentPeriodClicks[0]?.totalClicks || 0;
    const clicksGrowth = previousClicks > 0 ? 
      Math.round(((currentClicks - previousClicks) / previousClicks) * 100) : 0;

    const analytics = {
      overview: {
        totalUrls,
        activeUrls,
        expiredUrls,
        totalClicks: totalClicksValue,
        averageClicks,
        urlsWithClicks,
        clicksGrowth
      },
      topUrls: processedTopUrls,
      recentUrls: processedRecentUrls,
      clicksOverTime: processedClicksOverTime,
      tagStats: processedTagStats,
      period: {
        startDate: startDate || (period !== 'all' ? new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString() : null),
        endDate: endDate || new Date().toISOString(),
        period
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error: any) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
