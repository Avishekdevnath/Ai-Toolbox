import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { generateUniqueShortCode, normalizeUrl, isValidUrl } from '@/lib/urlShortenerUtils';

const COLLECTION_NAME = 'shortened_urls';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalUrl, customAlias } = body;

    console.log('🧪 Testing URL creation and lookup...');

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

    // Generate short code (always generate unique, ignore customAlias for testing)
    const shortCode = await generateUniqueShortCode(db, COLLECTION_NAME, true);
    const normalizedUrl = normalizeUrl(originalUrl);
    
    console.log('🔑 Generated short code:', shortCode);

    // Get client IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Create shortened URL document
    const shortenedUrl = {
      originalUrl: normalizedUrl,
      shortCode,
      customAlias: undefined, // No custom alias for testing
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      healthStatus: 'unknown',
      tags: ['test'],
      description: 'Test URL creation',
      clickHistory: [],
      ipAddress: clientIp
    };

    console.log('📝 Creating URL document:', shortenedUrl);

    // Insert into database
    const result = await db.collection(COLLECTION_NAME).insertOne(shortenedUrl);
    
    if (!result.insertedId) {
      return NextResponse.json(
        { error: 'Failed to create shortened URL' },
        { status: 500 }
      );
    }

    console.log('✅ URL created with ID:', result.insertedId);

    // Immediately try to find it
    const foundUrl = await db.collection(COLLECTION_NAME).findOne({
      shortCode: shortCode,
      isActive: true
    });

    console.log('🔍 Found URL after creation:', !!foundUrl);

    // Also try the exact query from the redirect page
    const redirectQuery = await db.collection(COLLECTION_NAME).findOne({
      shortCode: shortCode,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    console.log('🔍 Found URL with redirect query:', !!redirectQuery);

    return NextResponse.json({
      success: true,
      data: {
        ...shortenedUrl,
        _id: result.insertedId,
        shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${shortCode}`
      },
      testResults: {
        shortCode,
        created: true,
        foundImmediately: !!foundUrl,
        foundWithRedirectQuery: !!redirectQuery,
        insertedId: result.insertedId
      }
    });

  } catch (error: any) {
    console.error('❌ Error testing URL creation:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
