import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isValidUrl, normalizeUrl, generateExpirationDate, isUrlExpired } from '@/lib/urlShortenerUtils';
import { UrlShortenerSchema } from '@/schemas/urlShortenerSchema';

const COLLECTION_NAME = 'shortened_urls';

/**
 * GET /api/url-shortener/[id]
 * Get a specific shortened URL by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid URL ID format' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const url = await db.collection(COLLECTION_NAME).findOne({ 
      _id: new ObjectId(id),
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const urlWithShortened = {
      ...url,
      shortenedUrl: `${baseUrl}/r/${url.shortCode}`,
      isExpired: isUrlExpired(url)
    };

    return NextResponse.json({
      success: true,
      data: urlWithShortened
    });

  } catch (error: any) {
    console.error('Error fetching shortened URL:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/url-shortener/[id]
 * Update a shortened URL
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid URL ID format' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if URL exists
    const existingUrl = await db.collection(COLLECTION_NAME).findOne({ 
      _id: new ObjectId(id),
      isActive: true 
    });

    if (!existingUrl) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.originalUrl) {
      if (!isValidUrl(body.originalUrl)) {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
      updateData.originalUrl = normalizeUrl(body.originalUrl);
    }
    
    if (body.expiresInDays !== undefined) {
      updateData.expiresAt = body.expiresInDays ? generateExpirationDate(body.expiresInDays) : null;
    }
    
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    // Update the URL
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    // Get updated URL
    const updatedUrl = await db.collection(COLLECTION_NAME).findOne({ 
      _id: new ObjectId(id) 
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const urlWithShortened = {
      ...updatedUrl,
      shortenedUrl: `${baseUrl}/r/${updatedUrl.shortCode}`,
      isExpired: isUrlExpired(updatedUrl)
    };

    return NextResponse.json({
      success: true,
      data: urlWithShortened
    });

  } catch (error: any) {
    console.error('Error updating shortened URL:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/url-shortener/[id]
 * Delete a shortened URL
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid URL ID format' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Hard delete - remove the document from database
    const result = await db.collection(COLLECTION_NAME).deleteOne(
      { _id: new ObjectId(id) }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'URL deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting shortened URL:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 