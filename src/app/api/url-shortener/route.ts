import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import {
  ShortenedUrl,
  CreateUrlRequest,
  isValidUrl,
  normalizeUrl,
  isValidCustomAlias,
  generateUniqueShortCode,
  generateExpirationDate,
  isUrlExpired,
  sanitizeCreateUrlRequest
} from '@/lib/urlShortenerUtils';

const COLLECTION_NAME = 'shortened_urls';

/**
 * POST /api/url-shortener
 * Create a new shortened URL
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateUrlRequest = await request.json();
    
    // Sanitize and validate input
    let sanitizedRequest: CreateUrlRequest;
    try {
      sanitizedRequest = sanitizeCreateUrlRequest(body);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Invalid input data' },
        { status: 400 }
      );
    }
    
    const { originalUrl, customAlias, expiresInDays, userId } = sanitizedRequest;

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

    if (customAlias && !isValidCustomAlias(customAlias)) {
      return NextResponse.json(
        { error: 'Custom alias must be 3-20 characters, letters, numbers, hyphens, and underscores only' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

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
    
    // Create shortened URL document
    const shortenedUrl: ShortenedUrl = {
      originalUrl: normalizedUrl,
      shortCode,
      customAlias: customAlias || undefined,
      clicks: 0,
      createdAt: new Date(),
      expiresAt: expiresInDays ? generateExpirationDate(expiresInDays) : undefined,
      userId: userId || undefined,
      isActive: true
    };

    // Insert into database
    const result = await db.collection(COLLECTION_NAME).insertOne(shortenedUrl);
    
    // Return the created URL
    const createdUrl = {
      ...shortenedUrl,
      _id: result.insertedId,
      shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/r/${shortCode}`
    };

    return NextResponse.json({
      success: true,
      data: createdUrl
    });

  } catch (error: any) {
    console.error('Error creating shortened URL:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/url-shortener
 * Get list of shortened URLs (with optional filtering)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Build query
    const query: any = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (activeOnly) {
      query.isActive = true;
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ];
    }

    // Get URLs with pagination
    const urls = await db.collection(COLLECTION_NAME)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Get total count
    const totalCount = await db.collection(COLLECTION_NAME).countDocuments(query);

    // Add shortened URL to each result
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const urlsWithShortened = urls.map(url => ({
      ...url,
      shortenedUrl: `${baseUrl}/r/${url.shortCode}`,
      isExpired: isUrlExpired(url)
    }));

    return NextResponse.json({
      success: true,
      data: urlsWithShortened,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error: any) {
    console.error('Error fetching shortened URLs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 