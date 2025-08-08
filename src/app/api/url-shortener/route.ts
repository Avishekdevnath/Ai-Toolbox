import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ShortenedUrlModel } from '@/schemas/urlShortenerSchema';
import { 
  sanitizeCreateUrlRequest, 
  isValidUrl, 
  isValidCustomAlias,
  generateUniqueShortCode, 
  getAnonymousUserSession,
  generateExpirationDate
} from '@/lib/urlShortenerUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Sanitize and validate request
    const sanitizedRequest = sanitizeCreateUrlRequest(body);
    
    if (!sanitizedRequest.originalUrl) {
      return NextResponse.json(
        { error: 'Original URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(sanitizedRequest.originalUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate custom alias if provided
    if (sanitizedRequest.customAlias && !isValidCustomAlias(sanitizedRequest.customAlias)) {
      return NextResponse.json(
        { error: 'Custom alias must be 3-20 characters, letters, numbers, hyphens, and underscores only' },
        { status: 400 }
      );
    }

    // Use the client-provided session data instead of creating a new one
    const anonymousUserId = sanitizedRequest.anonymousUserId;
    const deviceFingerprint = sanitizedRequest.deviceFingerprint;

    // Validate session
    if (!anonymousUserId || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 400 }
      );
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Check if custom alias already exists
    if (sanitizedRequest.customAlias) {
      const existingUrl = await ShortenedUrlModel.findOne({
        shortCode: sanitizedRequest.customAlias
      });

      if (existingUrl) {
        return NextResponse.json(
          { error: 'Custom alias already exists' },
          { status: 409 }
        );
      }
    }

    // Generate short code
    const shortCode = sanitizedRequest.customAlias || 
      await generateUniqueShortCode(mongoose.connection.db, 'shortened_urls', false);

    // Process expiration date
    let expiresAt: Date | null = null;
    
    if (sanitizedRequest.expiresAt) {
      // If expiresAt is provided as a string, parse it
      expiresAt = new Date(sanitizedRequest.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiration date format' },
          { status: 400 }
        );
      }
    } else if (sanitizedRequest.expiresInDays) {
      // If expiresInDays is provided, generate expiration date
      expiresAt = generateExpirationDate(sanitizedRequest.expiresInDays);
    }

    // Create shortened URL
    const shortenedUrl = new ShortenedUrlModel({
      originalUrl: sanitizedRequest.originalUrl,
      shortCode,
      anonymousUserId,
      deviceFingerprint,
      expiresAt,
      isActive: true,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save to database
    const savedUrl = await shortenedUrl.save();
    
    if (!savedUrl._id) {
      return NextResponse.json(
        { error: 'Failed to create shortened URL' },
        { status: 500 }
      );
    }

    // Return success response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shortenedUrlString = `${baseUrl}/${shortCode}`;

    const response = {
      success: true,
      data: {
        id: savedUrl._id,
        originalUrl: savedUrl.originalUrl,
        shortenedUrl: shortenedUrlString,
        shortCode: savedUrl.shortCode,
        expiresAt: savedUrl.expiresAt,
        createdAt: savedUrl.createdAt
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error creating shortened URL:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const anonymousUserId = searchParams.get('anonymousUserId');

    if (!anonymousUserId) {
      return NextResponse.json(
        { error: 'Anonymous user ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build query
    const query: any = { anonymousUserId };
    
    if (activeOnly) {
      query.isActive = true;
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ];
    }

    // Get URLs
    const urls = await ShortenedUrlModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Format response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const formattedUrls = urls.map(url => ({
      ...url,
      shortenedUrl: `${baseUrl}/${url.shortCode}`,
      isExpired: url.expiresAt ? new Date() > new Date(url.expiresAt) : false
    }));

    return NextResponse.json({
      success: true,
      data: formattedUrls
    });

  } catch (error: any) {
    console.error('Error fetching URLs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 