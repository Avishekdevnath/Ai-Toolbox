import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { generateUniqueShortCode, normalizeUrl, isValidUrl } from '@/lib/urlShortenerUtils';

const COLLECTION_NAME = 'shortened_urls';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalUrl, customAlias } = body;

    console.log('🧪 Testing URL shortener with URL:', originalUrl?.substring(0, 100) + '...');

    // Validate input
    if (!originalUrl?.trim()) {
      return NextResponse.json(
        { error: 'Original URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(originalUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if custom alias already exists
    if (customAlias) {
      const existing = await db.collection(COLLECTION_NAME).findOne({ 
        shortCode: customAlias,
        isActive: true 
      });
      
      if (existing) {
        return NextResponse.json(
          { error: 'Custom alias already exists' },
          { status: 409 }
        );
      }
    }

    // Generate short code
    const shortCode = customAlias || await generateUniqueShortCode(db, COLLECTION_NAME, true);
    const normalizedUrl = normalizeUrl(originalUrl);
    
    // Get client IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Create shortened URL document
    const shortenedUrl = {
      originalUrl: normalizedUrl,
      shortCode,
      customAlias: customAlias || undefined,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      healthStatus: 'unknown',
      tags: ['test'],
      description: 'Test URL shortening',
      clickHistory: [],
      ipAddress: clientIp
    };

    // Insert into database
    const result = await db.collection(COLLECTION_NAME).insertOne(shortenedUrl);
    
    if (!result.insertedId) {
      return NextResponse.json(
        { error: 'Failed to create shortened URL' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const originalLength = originalUrl.length;
    const shortenedLength = shortCode.length + (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').length + 1;
    const spaceSaved = originalLength - shortenedLength;
    const reductionPercentage = Math.round((spaceSaved / originalLength) * 100);

    // Add the generated shortened URL to the response
    const responseData = {
      ...shortenedUrl,
      _id: result.insertedId,
      shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${shortCode}`,
      statistics: {
        originalLength,
        shortenedLength,
        spaceSaved,
        reductionPercentage,
        isLongUrl: originalLength > 100,
        urlType: originalUrl.includes('google.com/search') ? 'Google Search' : 'Other'
      }
    };

    console.log('✅ URL shortened successfully:', {
      originalLength,
      shortenedLength,
      reductionPercentage: reductionPercentage + '%'
    });

    return NextResponse.json({
      success: true,
      data: responseData,
      message: `URL shortened successfully! Reduced by ${reductionPercentage}%`
    });

  } catch (error: any) {
    console.error('❌ Error testing URL shortener:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
