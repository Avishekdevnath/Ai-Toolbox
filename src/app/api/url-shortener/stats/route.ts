import { NextRequest, NextResponse } from 'next/server';
import {clientPromise } from '@/lib/mongodb';
import { getDatabase } from '@/lib/mongodb';
import { calculateUrlStats } from '@/lib/urlShortenerUtils';

const COLLECTION_NAME = 'shortened_urls';

/**
 * GET /api/url-shortener/stats
 * Get URL shortener statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = await getDatabase();

    // Build query
    const query: any = {};
    if (userId) {
      query.userId = userId;
    }

    // Get all URLs for statistics
    const urls = await db.collection(COLLECTION_NAME)
      .find(query)
      .toArray();

    // Calculate statistics
    const stats = calculateUrlStats(urls);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching URL statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 