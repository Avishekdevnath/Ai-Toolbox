import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { generateAnonymousUserId } from '@/lib/urlShortenerUtils';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing anonymous user ID approach...');

    const db = await getDatabase();
    
    // Get all URLs and analyze user ID patterns
    const allUrls = await db.collection('shortened_urls').find({}).toArray();
    
    const analysis = {
      totalUrls: allUrls.length,
      userPatterns: {
        withUserId: allUrls.filter(url => url.userId && !url.anonymousUserId).length,
        withAnonymousUserId: allUrls.filter(url => url.anonymousUserId && !url.userId).length,
        withBoth: allUrls.filter(url => url.userId && url.anonymousUserId).length,
        withNeither: allUrls.filter(url => !url.userId && !url.anonymousUserId).length,
        withNullAnonymous: allUrls.filter(url => url.anonymousUserId === null).length,
        withUndefinedAnonymous: allUrls.filter(url => url.anonymousUserId === undefined).length
      },
      sampleData: allUrls.slice(0, 5).map(url => ({
        shortCode: url.shortCode,
        userId: url.userId,
        anonymousUserId: url.anonymousUserId,
        hasUserIdentifier: !!(url.userId || url.anonymousUserId)
      }))
    };

    // Test creating a URL with anonymous user ID
    const testAnonymousId = generateAnonymousUserId();
    const testUrl = {
      originalUrl: 'https://example.com/test',
      shortCode: `test-${Date.now()}`,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      anonymousUserId: testAnonymousId,
      ipAddress: '127.0.0.1'
    };

    console.log('📊 Current database analysis:', analysis);
    console.log('🔑 Generated test anonymous ID:', testAnonymousId);

    return NextResponse.json({
      success: true,
      message: 'Anonymous user ID approach is more professional',
      analysis,
      testData: {
        generatedAnonymousId: testAnonymousId,
        testUrl: testUrl
      },
      benefits: [
        'Consistent data structure - no null values',
        'Better analytics and tracking capabilities',
        'Easier database queries and filtering',
        'Professional industry standard approach',
        'Future-proof for additional features',
        'Better user experience with persistent sessions'
      ]
    });

  } catch (error: any) {
    console.error('❌ Error testing anonymous users:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
