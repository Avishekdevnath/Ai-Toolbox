import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserAuthService } from '@/lib/userAuthService';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'shortened_urls';

/**
 * GET /api/url-shortener/user/urls/[id]
 * Get a specific user's URL by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check user authentication
    const userSession = await UserAuthService.getUserSession(request);
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const db = await getDatabase();
    
    // Find URL belonging to the user
    const url = await db.collection(COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
      userId: userSession.id,
      isActive: true
    });

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL not found' },
        { status: 404 }
      );
    }

    // Add computed fields
    const processedUrl = {
      ...url,
      shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${url.shortCode}`
    };

    return NextResponse.json({
      success: true,
      data: processedUrl
    });

  } catch (error: any) {
    console.error('Error fetching user URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/url-shortener/user/urls/[id]
 * Update a user's URL
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check user authentication
    const userSession = await UserAuthService.getUserSession(request);
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      originalUrl, 
      customAlias, 
      expiresInDays, 
      expiresAt, 
      tags,
      description,
      isActive
    } = body;

    const db = await getDatabase();

    // Check if URL exists and belongs to user
    const existingUrl = await db.collection(COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
      userId: userSession.id
    });

    if (!existingUrl) {
      return NextResponse.json(
        { success: false, error: 'URL not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (originalUrl) {
      const { normalizeUrl } = await import('@/lib/urlShortenerUtils');
      updateData.originalUrl = normalizeUrl(originalUrl);
    }

    if (customAlias !== undefined) {
      if (customAlias && customAlias !== existingUrl.shortCode) {
        // Check if new custom alias already exists
        const aliasExists = await db.collection(COLLECTION_NAME).findOne({
          shortCode: customAlias,
          isActive: true,
          _id: { $ne: new ObjectId(id) }
        });
        
        if (aliasExists) {
          return NextResponse.json(
            { error: 'Custom alias already exists' },
            { status: 409 }
          );
        }
        updateData.shortCode = customAlias;
        updateData.customAlias = customAlias;
      } else if (!customAlias) {
        updateData.customAlias = undefined;
      }
    }

    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    } else if (expiresInDays !== undefined) {
      if (expiresInDays) {
        const { generateExpirationDate } = await import('@/lib/urlShortenerUtils');
        updateData.expiresAt = generateExpirationDate(expiresInDays);
      } else {
        updateData.expiresAt = null;
      }
    }

    if (tags !== undefined) {
      updateData.tags = tags || [];
    }

    if (description !== undefined) {
      updateData.description = description || undefined;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update URL
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id), userId: userSession.id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'URL not found' },
        { status: 404 }
      );
    }

    // Get updated URL
    const updatedUrl = await db.collection(COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
      userId: userSession.id
    });

    const processedUrl = {
      ...updatedUrl,
      shortenedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${updatedUrl.shortCode}`
    };

    return NextResponse.json({
      success: true,
      data: processedUrl,
      message: 'URL updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating user URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/url-shortener/user/urls/[id]
 * Delete a user's URL (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check user authentication
    const userSession = await UserAuthService.getUserSession(request);
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const db = await getDatabase();

    // Soft delete URL (set isActive to false)
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id), userId: userSession.id },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'URL not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'URL deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting user URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
