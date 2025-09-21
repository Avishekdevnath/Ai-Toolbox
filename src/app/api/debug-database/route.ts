import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging database contents...');

    const db = await getDatabase();
    
    // Get all URLs from the database
    const allUrls = await db.collection('shortened_urls').find({}).toArray();
    
    console.log('📊 Total URLs in database:', allUrls.length);
    console.log('📋 All URLs:', allUrls.map(url => ({
      _id: url._id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      isActive: url.isActive,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      userId: url.userId,
      anonymousUserId: url.anonymousUserId
    })));

    // Check for specific short codes
    const linkgo001 = await db.collection('shortened_urls').findOne({ shortCode: 'linkgo001' });
    const urllink058 = await db.collection('shortened_urls').findOne({ shortCode: 'urllink058' });

    console.log('🔍 linkgo001 found:', !!linkgo001);
    console.log('🔍 urllink058 found:', !!urllink058);

    // Check collection count
    const count = await db.collection('shortened_urls').countDocuments();
    console.log('📈 Collection count:', count);

    return NextResponse.json({
      success: true,
      totalUrls: allUrls.length,
      urls: allUrls.map(url => ({
        _id: url._id,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        isActive: url.isActive,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
        userId: url.userId,
        anonymousUserId: url.anonymousUserId
      })),
      specificChecks: {
        linkgo001: !!linkgo001,
        urllink058: !!urllink058
      },
      collectionCount: count
    });

  } catch (error: any) {
    console.error('❌ Error debugging database:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
}
