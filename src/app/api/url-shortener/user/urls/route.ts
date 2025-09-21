import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserAuthService } from '@/lib/userAuthService';
import { isUrlExpired } from '@/lib/urlShortenerUtils';

const COLLECTION_NAME = 'shortened_urls';

/**
 * GET /api/url-shortener/user/urls
 * Get user's shortened URLs with pagination and filtering
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const tag = searchParams.get('tag') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { 
      userId: userSession.id,
      isActive: true 
    };

    // Add filters
    if (activeOnly) {
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ];
    }

    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const db = await getDatabase();
    
    // Get URLs with pagination
    const urls = await db.collection(COLLECTION_NAME)
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalCount = await db.collection(COLLECTION_NAME).countDocuments(query);

    // Add computed fields
    const processedUrls = urls.map(url => ({
      ...url,
      shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${url.shortCode}`,
      isExpired: isUrlExpired(url)
    }));

    return NextResponse.json({
      success: true,
      data: processedUrls,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error: any) {
    console.error('Error fetching user URLs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/url-shortener/user/urls
 * Create a new shortened URL for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Check user authentication
    const userSession = await UserAuthService.getUserSession(request);
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      originalUrl, 
      customAlias, 
      expiresInDays, 
      expiresAt, 
      tags,
      description
    } = body;

    // Validate input
    if (!originalUrl?.trim()) {
      return NextResponse.json(
        { error: 'Original URL is required' },
        { status: 400 }
      );
    }

    // Check user quota (optional - can be implemented later)
    // const userQuota = await checkUserQuota(userSession.id);
    // if (userQuota.exceeded) {
    //   return NextResponse.json(
    //     { error: 'URL quota exceeded' },
    //     { status: 429 }
    //   );
    // }

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
    const { generateUniqueShortCode } = await import('@/lib/urlShortenerUtils');
    const shortCode = customAlias || await generateUniqueShortCode(db, COLLECTION_NAME, true);
    const { normalizeUrl } = await import('@/lib/urlShortenerUtils');
    const normalizedUrl = normalizeUrl(originalUrl);
    
    let expirationDate: Date | undefined = undefined;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
    } else if (expiresInDays) {
      const { generateExpirationDate } = await import('@/lib/urlShortenerUtils');
      expirationDate = generateExpirationDate(expiresInDays);
    }

    // Get client IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Create shortened URL document
    const shortenedUrl = {
      originalUrl: normalizedUrl,
      shortCode,
      customAlias: customAlias || undefined,
      userId: userSession.id,
      userEmail: userSession.email,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expirationDate,
      isActive: true,
      healthStatus: 'unknown',
      lastCheckedAt: undefined,
      tags: tags || [],
      description: description || undefined,
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

    // Add the generated shortened URL to the response
    const responseData = {
      ...shortenedUrl,
      _id: result.insertedId,
      shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${shortCode}`
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error: any) {
    console.error('Error creating user URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
