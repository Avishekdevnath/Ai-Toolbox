import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { calculateUrlStats } from '@/lib/urlShortenerUtils';
import { UrlShortenerSchema } from '@/schemas/urlShortenerSchema';

const COLLECTION_NAME = 'shortened_urls';

/**
 * GET /api/url-shortener/stats
 * Get URL statistics for a user
 *
 * Query parameters:
 * - userId: string (for signed-in users)
 * - anonymousUserId: string (for anonymous users)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const anonymousUserId = searchParams.get('anonymousUserId');

    // Build query
    const query: any = { isActive: true };
    
    if (userId) {
      query.userId = userId;
    } else if (anonymousUserId) {
      query.anonymousUserId = anonymousUserId;
    } else {
      // If no user identifier provided, return empty stats
      return NextResponse.json({
        success: true,
        data: {
          totalUrls: 0,
          totalClicks: 0,
          recentUrls: 0,
          topUrls: [],
          healthStatus: {
            ok: 0,
            broken: 0,
            unknown: 0
          }
        }
      });
    }

    const db = await getDatabase();
    
    // Get all URLs for the user
    const urls = await db.collection(COLLECTION_NAME)
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate comprehensive stats
    const stats = calculateUrlStats(urls);

    // Get recent URLs (last 5 created)
    const recentUrls = urls.slice(0, 5).map(url => ({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      healthStatus: url.healthStatus
    }));

    // Get top performing URLs (top 5 by clicks)
    const topUrls = urls
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 5)
      .map(url => ({
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        healthStatus: url.healthStatus
      }));

    return NextResponse.json({
      success: true,
      data: {
        totalUrls: stats.totalUrls,
        totalClicks: stats.totalClicks,
        activeUrls: stats.activeUrls,
        expiredUrls: stats.expiredUrls,
        averageClicks: stats.averageClicks,
        recentUrls,
        topUrls,
        healthStatus: stats.healthStatus,
        recentActivity: stats.recentActivity.slice(0, 10) // Last 10 clicks
      }
    });

  } catch (error: any) {
    console.error('Error fetching URL statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 