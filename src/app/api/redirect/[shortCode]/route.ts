import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UrlShortenerModel } from '@/models/UrlShortenerModel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;
    
    console.log('🔗 Redirecting short code:', shortCode);

    const db = await getDatabase();
    const urlData = await UrlShortenerModel.findByShortCode(shortCode);

    if (!urlData) {
      console.log('❌ Short code not found:', shortCode);
      return NextResponse.json(
        { error: 'Short URL not found' },
        { status: 404 }
      );
    }

    // Check if URL is expired
    if (urlData.expiresAt && new Date() > urlData.expiresAt) {
      console.log('❌ URL expired:', shortCode);
      return NextResponse.json(
        { error: 'This short URL has expired' },
        { status: 410 }
      );
    }

    // Check if URL is active
    if (!urlData.isActive) {
      console.log('❌ URL is inactive:', shortCode);
      return NextResponse.json(
        { error: 'This short URL is no longer active' },
        { status: 410 }
      );
    }

    // Track click
    try {
      await UrlShortenerModel.trackClick(shortCode, {
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        referer: request.headers.get('referer') || undefined
      });
    } catch (error) {
      console.error('Error tracking click:', error);
      // Don't fail the redirect if tracking fails
    }

    console.log('✅ Redirecting to:', urlData.originalUrl);

    // Perform redirect
    return NextResponse.redirect(urlData.originalUrl, 302);

  } catch (error: any) {
    console.error('Error in redirect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}