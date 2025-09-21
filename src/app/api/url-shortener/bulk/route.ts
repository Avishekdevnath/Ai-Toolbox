import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserAuthService } from '@/lib/userAuthService';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { operation, urlIds } = await request.json();

    if (!operation || !urlIds || !Array.isArray(urlIds) || urlIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Operation and URL IDs are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const userSession = await UserAuthService.getUserSession(request);
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('shortened_urls');

    // Convert string IDs to ObjectIds
    const objectIds = urlIds.map((id: string) => new ObjectId(id));

    // Verify all URLs belong to the user
    const userUrls = await collection.find({
      _id: { $in: objectIds },
      userId: userSession.userId
    }).toArray();

    if (userUrls.length !== urlIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some URLs not found or not owned by user' },
        { status: 403 }
      );
    }

    let result;
    const timestamp = new Date();

    switch (operation) {
      case 'delete':
        result = await collection.updateMany(
          { _id: { $in: objectIds } },
          { 
            $set: { 
              isActive: false,
              updatedAt: timestamp,
              deletedAt: timestamp
            }
          }
        );
        break;

      case 'activate':
        result = await collection.updateMany(
          { _id: { $in: objectIds } },
          { 
            $set: { 
              isActive: true,
              updatedAt: timestamp
            },
            $unset: { deletedAt: 1 }
          }
        );
        break;

      case 'deactivate':
        result = await collection.updateMany(
          { _id: { $in: objectIds } },
          { 
            $set: { 
              isActive: false,
              updatedAt: timestamp
            }
          }
        );
        break;

      case 'extend':
        const { days } = await request.json();
        if (!days || days < 1) {
          return NextResponse.json(
            { success: false, error: 'Valid number of days required for extension' },
            { status: 400 }
          );
        }
        
        const newExpirationDate = new Date();
        newExpirationDate.setDate(newExpirationDate.getDate() + days);
        
        result = await collection.updateMany(
          { _id: { $in: objectIds } },
          { 
            $set: { 
              expiresAt: newExpirationDate,
              updatedAt: timestamp
            }
          }
        );
        break;

      case 'remove_expiration':
        result = await collection.updateMany(
          { _id: { $in: objectIds } },
          { 
            $unset: { expiresAt: 1 },
            $set: { updatedAt: timestamp }
          }
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${operation} operation completed successfully`,
      modifiedCount: result.modifiedCount,
      affectedUrls: urlIds.length
    });

  } catch (error: any) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const userSession = await UserAuthService.getUserSession(request);
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('shortened_urls');

    // Get user's URLs for export
    const urls = await collection.find({
      userId: userSession.userId,
      isActive: true
    }).sort({ createdAt: -1 }).toArray();

    const exportData = urls.map(url => ({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${url.shortCode}`,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      isActive: url.isActive,
      tags: url.tags || [],
      description: url.description || ''
    }));

    return NextResponse.json({
      success: true,
      data: exportData,
      count: exportData.length
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
