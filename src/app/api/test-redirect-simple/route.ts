import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shortCode = searchParams.get('shortCode');

    if (!shortCode) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing redirect for short code:', shortCode);

    const db = await getDatabase();
    
    // Find the URL
    const urlData = await db.collection('shortened_urls').findOne({
      shortCode: shortCode,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    if (!urlData) {
      return NextResponse.json(
        { error: 'Short code not found', shortCode },
        { status: 404 }
      );
    }

    console.log('✅ Found URL, would redirect to:', urlData.originalUrl);

    // Return the redirect information instead of actually redirecting
    return NextResponse.json({
      success: true,
      shortCode,
      originalUrl: urlData.originalUrl,
      redirectUrl: urlData.originalUrl,
      message: 'Redirect would work - URL found successfully'
    });

  } catch (error: any) {
    console.error('❌ Error testing redirect:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
