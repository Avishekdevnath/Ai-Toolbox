import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { clientPromise } from '@/lib/mongodb';
import { ShortenedUrl } from '@/lib/urlShortenerUtils';

const COLLECTION_NAME = 'shortened_urls';

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
        { error: 'Invalid URL ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Soft delete by setting isActive to false
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false } }
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

  } catch (error) {
    console.error('Error deleting shortened URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
        { error: 'Invalid URL ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Only allow updating certain fields
    const allowedUpdates = ['isActive', 'expiresAt'];
    const updates: Partial<ShortenedUrl> = {};
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedUpdates.includes(key)) {
        updates[key as keyof ShortenedUrl] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    // Get the updated URL
    const updatedUrl = await db.collection(COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    });

    if (!updatedUrl) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated URL' },
        { status: 500 }
      );
    }

    // Add shortened URL to response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const responseUrl = {
      ...updatedUrl,
      shortenedUrl: `${baseUrl}/r/${updatedUrl.shortCode}`
    };

    return NextResponse.json({
      success: true,
      data: responseUrl
    });

  } catch (error) {
    console.error('Error updating shortened URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 