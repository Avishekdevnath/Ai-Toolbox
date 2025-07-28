import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if CLERK_SECRET_KEY is available on server side
    const hasSecretKey = !!process.env.CLERK_SECRET_KEY;
    const hasPublishableKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    
    return NextResponse.json({
      success: true,
      serverStatus: {
        hasSecretKey,
        hasPublishableKey,
        secretKeyLength: process.env.CLERK_SECRET_KEY?.length || 0,
        publishableKeyLength: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.length || 0,
      },
      message: hasSecretKey ? 'Clerk is properly configured on server side' : 'CLERK_SECRET_KEY is missing on server side'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check Clerk configuration'
    }, { status: 500 });
  }
} 