import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UrlShortenerModel } from '@/models/UrlShortenerModel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;
    
    console.log('🔍 Debugging short code:', shortCode);

    const db = await getDatabase();
    
    // First, let's see what's in the database
    const allUrls = await db.collection('shortened_urls').find({}).limit(10).toArray();
    console.log('📊 All URLs in database:', allUrls.map(url => ({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      isActive: url.isActive,
      expiresAt: url.expiresAt
    })));

    // Now try to find the specific short code
    const urlData = await UrlShortenerModel.findByShortCode(shortCode);
    console.log('🔍 Found URL data:', urlData);

    // Also try direct database query
    const directQuery = await db.collection('shortened_urls').findOne({
      shortCode: shortCode,
      isActive: true
    });
    console.log('🔍 Direct query result:', directQuery);

    return NextResponse.json({
      success: true,
      shortCode,
      urlData,
      directQuery,
      allUrls: allUrls.map(url => ({
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        isActive: url.isActive,
        expiresAt: url.expiresAt
      }))
    });

  } catch (error: any) {
    console.error('Error debugging URL:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
}
