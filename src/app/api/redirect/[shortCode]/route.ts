import { getDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { isUrlExpired } from '@/lib/urlShortenerUtils';
import { UrlShortenerSchema } from '@/schemas/urlShortenerSchema';

const COLLECTION_NAME = 'shortened_urls';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params;
    
    if (!shortCode) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Find the URL by short code
    const url = await db.collection(COLLECTION_NAME).findOne({ 
      shortCode,
      isActive: true 
    });

    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    // Check if URL is expired
    if (isUrlExpired(url)) {
      return NextResponse.json(
        { error: 'URL has expired' },
        { status: 410 }
      );
    }

    // Increment click count
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: url._id },
      { $inc: { clicks: 1 } }
    );

    // Redirect to original URL
    return NextResponse.redirect(url.originalUrl);

  } catch (error: any) {
    console.error('Error redirecting URL:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 