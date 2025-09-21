import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserAuthService } from '@/lib/userAuthService';
import {
  ShortenedUrl,
  CreateUrlRequest,
  isValidCustomAlias,
  UrlShortenerSchema
} from '@/schemas/urlShortenerSchema';
import {
  isValidUrl,
  normalizeUrl,
  generateUniqueShortCode,
  generateExpirationDate,
  isUrlExpired,
  sanitizeCreateUrlRequest,
  generateClickEvent
} from '@/lib/urlShortenerUtils';

const COLLECTION_NAME = 'shortened_urls';

/**
 * POST /api/url-shortener
 * Create a new shortened URL
 *
 * Request body:
 * {
 *   originalUrl: string,
 *   customAlias?: string, // Optional custom short URL (e.g. /myshorturl)
 *   expiresInDays?: number, // Optional expiration in days (lifetime if omitted)
 *   expiresAt?: string, // Optional exact expiration date/time
 *   userId?: string, // For signed-in users
 *   anonymousUserId?: string, // For anonymous users
 *   deviceFingerprint?: string, // Device fingerprint for anonymous users
 *   ipAddress?: string, // IP address for tracking
 *   tags?: string[], // Optional tags for organization
 *   description?: string // Optional description
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateUrlRequest = await request.json();
    
    // Check for authenticated user first
    const userSession = await UserAuthService.getUserSession(request);
    
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
    
    const { 
      originalUrl, 
      customAlias, 
      expiresInDays, 
      expiresAt, 
      userId, 
      anonymousUserId,
      deviceFingerprint,
      ipAddress,
      tags,
      description
    } = sanitizedRequest;

    // Override userId if user is authenticated
    const finalUserId = userSession ? userSession.id : userId;
    const finalUserEmail = userSession ? userSession.email : undefined;
    
    // Ensure we always have a user identifier (anonymous or authenticated)
    const finalAnonymousUserId = userSession ? undefined : (anonymousUserId || generateAnonymousUserId());

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

    // Get IP address if not provided
    const clientIp = ipAddress || 
                    request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

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
    
    let expirationDate: Date | undefined = undefined;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
    } else if (expiresInDays) {
      expirationDate = generateExpirationDate(expiresInDays);
    }

    // Create shortened URL document
    const shortenedUrl: ShortenedUrl = {
      originalUrl: normalizedUrl,
      shortCode,
      customAlias: customAlias || undefined,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expirationDate,
      userId: finalUserId || undefined,
      userEmail: finalUserEmail || undefined,
      isActive: true,
      healthStatus: 'unknown',
      lastCheckedAt: undefined,
      tags: tags || undefined,
      description: description || undefined,
      clickHistory: [],
      // Anonymous user tracking (only if not authenticated)
      anonymousUserId: finalAnonymousUserId,
      deviceFingerprint: userSession ? undefined : (deviceFingerprint || undefined),
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

    // Add the generated shortened URL to the response
    const responseData = {
      ...shortenedUrl,
      _id: result.insertedId,
      shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${shortCode}`
    };

    // Create response object
    const response = new NextResponse();
    
    // Set anonymous user ID cookie if not authenticated
    if (!userSession && finalAnonymousUserId) {
      response.cookies.set('anonymousUserId', finalAnonymousUserId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 // 1 year
      });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      anonymousUserId: finalAnonymousUserId // Include for frontend use
    });

  } catch (error: any) {
    console.error('Error creating shortened URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/url-shortener
 * Get list of shortened URLs
 *
 * Query parameters:
 * - limit: number (default: 20)
 * - activeOnly: boolean (default: false)
 * - userId: string (for signed-in users)
 * - anonymousUserId: string (for anonymous users)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const userId = searchParams.get('userId');
    const anonymousUserId = searchParams.get('anonymousUserId');

    // Check for authenticated user first
    const userSession = await UserAuthService.getUserSession(request);

    // Build query
    const query: any = { isActive: true };
    
    if (userSession) {
      // Authenticated user - get their URLs
      query.userId = userSession.id;
    } else if (userId) {
      query.userId = userId;
    } else if (anonymousUserId) {
      query.anonymousUserId = anonymousUserId;
    } else {
      // Try to get anonymous user ID from cookie
      const cookieAnonymousId = request.cookies.get('anonymousUserId')?.value;
      if (cookieAnonymousId) {
        query.anonymousUserId = cookieAnonymousId;
      } else {
        // If no user identifier provided, return empty list
        return NextResponse.json({
          success: true,
          data: []
        });
      }
    }

    if (activeOnly) {
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ];
    }

    const db = await getDatabase();
    
    // Get URLs with pagination
    const urls = await db.collection(COLLECTION_NAME)
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Add computed fields
    const processedUrls = urls.map(url => ({
      ...url,
      shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${url.shortCode}`,
      isExpired: isUrlExpired(url as ShortenedUrl)
    }));

    return NextResponse.json({
      success: true,
      data: processedUrls
    });

  } catch (error: any) {
    console.error('Error fetching shortened URLs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 