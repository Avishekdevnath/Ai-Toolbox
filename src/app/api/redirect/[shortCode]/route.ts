import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { isUrlExpired } from '@/lib/urlShortenerUtils';

const COLLECTION_NAME = 'shortened_urls';

/**
 * GET /api/redirect/[shortCode]
 * Redirect to original URL and track click
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;
    
    if (!shortCode) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }

    console.log('Processing redirect for shortCode:', shortCode);

    const client = await clientPromise;
    const db = client.db();

    // Find the shortened URL
    const shortenedUrl = await db.collection(COLLECTION_NAME).findOne({
      shortCode,
      isActive: true
    });

    console.log('Found URL:', { 
      shortCode, 
      found: !!shortenedUrl, 
      clicks: shortenedUrl?.clicks,
      id: shortenedUrl?._id 
    });

    if (!shortenedUrl) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    // Check if URL has expired
    if (isUrlExpired(shortenedUrl)) {
      return NextResponse.json(
        { error: 'URL has expired' },
        { status: 410 }
      );
    }

    // Increment click count
    try {
      const updateResult = await db.collection(COLLECTION_NAME).updateOne(
        { _id: shortenedUrl._id },
        { $inc: { clicks: 1 } }
      );
      
      console.log('Click update result:', {
        shortCode,
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        oldClicks: shortenedUrl.clicks,
        newClicks: (shortenedUrl.clicks || 0) + 1
      });
    } catch (clickError) {
      console.error('Error tracking click:', clickError);
      // Don't fail the redirect if click tracking fails
    }

    // Return the redirect URL in response body
    return NextResponse.json({
      success: true,
      redirectUrl: shortenedUrl.originalUrl,
      shortCode: shortenedUrl.shortCode
    });

  } catch (error) {
    console.error('Error redirecting URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 