import { getDatabase } from '@/lib/mongodb';
import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function ShortCodePage({ params }: PageProps) {
  const { shortCode } = await params;

  try {
    console.log('🔗 Looking up short code:', shortCode);
    
    const db = await getDatabase();
    
    // First, let's check if the short code exists at all
    const anyMatch = await db.collection('shortened_urls').findOne({
      shortCode: shortCode
    });
    
    console.log('🔍 Any match found:', !!anyMatch);
    if (anyMatch) {
      console.log('📋 Found URL data:', {
        shortCode: anyMatch.shortCode,
        isActive: anyMatch.isActive,
        expiresAt: anyMatch.expiresAt,
        originalUrl: anyMatch.originalUrl
      });
    }
    
    // Direct database query to find the URL
    const urlData = await db.collection('shortened_urls').findOne({
      shortCode: shortCode,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    console.log('🔍 Query result:', !!urlData);

    if (!urlData) {
      console.log('❌ Short code not found:', shortCode);
      notFound();
    }

    console.log('✅ Found URL, redirecting to:', urlData.originalUrl);

    // Track click before redirecting (non-blocking)
    try {
      // Use direct database update instead of model method to avoid potential issues
      await db.collection('shortened_urls').updateOne(
        { shortCode: shortCode, isActive: true },
        { 
          $inc: { clicks: 1 },
          $push: ({ 
            clickHistory: {
              timestamp: new Date(),
              ip: 'unknown',
              userAgent: 'unknown',
              referer: undefined
            }
          } as any),
          $set: { updatedAt: new Date() }
        }
      );
      console.log('📊 Click tracked for:', shortCode);
    } catch (error) {
      console.error('Error tracking click:', error);
      // Don't fail the redirect if tracking fails
    }

    // Use Next.js redirect for proper HTTP redirect
    redirect(urlData.originalUrl);
  } catch (error: any) {
    // Check if this is a Next.js redirect error (which is expected)
    if (error.message === 'NEXT_REDIRECT') {
      // Re-throw redirect errors so Next.js can handle them properly
      throw error;
    }
    
    console.error('Error fetching URL:', error);
    notFound();
  }
} 
